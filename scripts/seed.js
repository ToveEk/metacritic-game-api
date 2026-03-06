import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Parses a CSV file and returns an array of objects representing each row.
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<Array<Object>>} A promise resolving to the array of parsed rows.
 */
async function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    })
}

/**
 * Transforms a CSV row into a game object.
 * @param {Object} row - The CSV row to transform.
 * @returns {Object} The transformed game object.
 */
function transformGame(row) {
    return {
        title: row.title,
        releaseDate: row.releaseDate || null,
        metascore: row.metascore ? parseInt(row.metascore) : null,
        userscore: row.userscore && row.userscore !== 'tbd'
            ? parseFloat(row.userscore)
            : null,
        description: row.description || null,
        developer: row.developer || null,
        publisher: row.publisher || null
    }
}

/**
 * Extracts genres from a CSV row.
 * @param {Object} row - The CSV row to extract genres from.
 * @returns {Array<string>} The array of extracted genres.
 */
function extractGenres(row) {
    if (!row.genres) return [];

    return row.genres
        .split(',')
        .map(genre => genre.trim())
        .filter(genre => genre.length > 0);
}

/**
 * Extracts platforms from a CSV row.
 * @param {Object} row - The CSV row to extract platforms from.
 * @returns {Array<string>} The array of extracted platforms.
 */
function extractPlatforms(row) {
    if (!row.platforms) return [];

    return row.platforms
        .split(',')
        .map(platform => platform.trim())
        .filter(platform => platform.length > 0);
}

/**
 * Seeds the genres table with the provided genre names.
 * @param {Array<string>} genres - The array of genre names to insert.
 */
async function seedGenres(genres) {
    for (const genre of genres) {
        await db.query(
            'INSERT INTO genres (name) VALUES (?)',
            [genre]
        )
    }
}

/**
 * Seeds the platforms table with the provided platform names.
 * @param {Array<string>} platforms - The array of platform names to insert.
 */
async function seedPlatforms(platforms) {
    for (const platform of platforms) {
        await db.query(
            'INSERT INTO platforms (name) VALUES (?)',
            [platform]
        )
    }
}

/**
 * Seeds the games table with the provided game objects.
 * @param {Array<Object>} games - The array of game objects to insert.
 */
async function seedGames(games) {
    for (const game of games) {
        await db.query(
            'INSERT INTO games (title, release_date, metascore, userscore, description, developer, publisher) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                game.title,
                game.releaseDate,
                game.metascore,
                game.userscore,
                game.description,
                game.developer,
                game.publisher
            ]
        )
    }
}

/**
 * Seeds the relations tables with the provided relations.
 * @param {Array<Object>} relations - The array of relation objects to insert.
 */
async function seedRelations(relations) {
    for (const relation of relations) {
        if (relation.type === 'genre') {
            await db.query(
                'INSERT INTO game_genres (game_id, genre_id) VALUES (?, ?)',
                [relation.gameId, relation.genreId]
            )
        } else if (relation.type === 'platform') {
            await db.query(
                'INSERT INTO game_platforms (game_id, platform_id) VALUES (?, ?)',
                [relation.gameId, relation.platformId]
            )
        }
    }
}

/**
 * Builds relations between games, genres, and platforms.
 * @param {Array<Object>} rows - The array of CSV rows.
 * @param {Object} gameMap - The map of game titles to IDs.
 * @param {Object} genreMap - The map of genre names to IDs.
 * @param {Object} platformMap - The map of platform names to IDs.
 */
async function buildRelations(rows, gameMap, genreMap, platformMap) {
    const relations = [];
    for (const row of rows) {
        const gameId = gameMap[row.title];
        if (!gameId) continue;

        for (const genre of extractGenres(row)) {
            const genreId = genreMap[genre];
            if (genreId) {
                relations.push({ type: 'genre', gameId, genreId });
            }
        }
        for (const platform of extractPlatforms(row)) {
            const platformId = platformMap[platform];
            if (platformId) {
                relations.push({ type: 'platform', gameId, platformId });
            }
        }
    }

    await seedRelations(relations);
}

/**
 * Clears all data from the database tables to ensure a clean slate for seeding.
 */
async function clearDatabase() {
    await db.query('DELETE FROM game_platforms');
    await db.query('DELETE FROM game_genres');
    await db.query('DELETE FROM games');
    await db.query('DELETE FROM genres');
    await db.query('DELETE FROM platforms');
}

/**
 * Main function to orchestrate the seeding process.
 */
async function seed() {
    await clearDatabase();

    if (!process.env.METACRITIC_CSV_PATH) {
        throw new Error('METACRITIC_CSV_PATH environment variable is not set');
    }
    const rows = await parseCSV(process.env.METACRITIC_CSV_PATH);

    const gamesArray = [];
    const genresSet = new Set();
    const platformsSet = new Set();

    for (const row of rows) {
        const game = transformGame(row);
        gamesArray.push(game);

        extractGenres(row).forEach(genre => genresSet.add(genre));
        extractPlatforms(row).forEach(platform => platformsSet.add(platform));
    }

    await seedGenres([...genresSet]);
    await seedPlatforms([...platformsSet]);
    await seedGames(gamesArray);

    const [gameRows] = await db.query('SELECT id, title FROM games');
    const [genreRows] = await db.query('SELECT id, name FROM genres');
    const [platformRows] = await db.query('SELECT id, name FROM platforms');

    const gameMap = Object.fromEntries(gameRows.map(game => [game.title, game.id]));
    const genreMap = Object.fromEntries(genreRows.map(genre => [genre.name, genre.id]));
    const platformMap = Object.fromEntries(platformRows.map(platform => [platform.name, platform.id]));

    await buildRelations(rows, gameMap, genreMap, platformMap);
}


seed()
    .then(async () => {
        console.log('Database seeding completed successfully.');
        await db.end()
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('Error seeding database:', error);
        await db.end()
        process.exit(1);
    });
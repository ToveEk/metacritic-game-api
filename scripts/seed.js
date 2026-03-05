import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../src/db.js';
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
        releaseDate: row.release_date || null,
        metascore: row.metascore ? parseInt(row.metascore) : null,
        userscore: row.userscore ? parseFloat(row.userscore) : null,
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
    // implement logic to insert into game_genres and game_platforms tables
}

/**
 * Main function to orchestrate the seeding process. It reads the CSV file, transforms the data, and seeds the database with genres, platforms, games, and their relations.
 */
async function seed() {
    const rows = await parseCSV(process.env.METACRITIC_CSV_PATH);

    const gamesArray = [];
    const genresSet = new Set();
    const platformsSet = new Set();

    for (const row of rows) {
        const game = transformGame(row);
        gamesArray.push(game);

        const rowGenres = extractGenres(row);
        const rowPlatforms = extractPlatforms(row);

        rowGenres.forEach(genre => genresSet.add(genre));
        rowPlatforms.forEach(platform => platformsSet.add(platform));
    }

    await seedGenres(Array.from(genresSet));
    await seedPlatforms(Array.from(platformsSet));
    await seedGames(gamesArray);
}

seed()
    .then(() => {
        console.log('Database seeding completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error seeding database:', error);
        process.exit(1);
    });
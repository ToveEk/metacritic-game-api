import { db } from "../config/db.js"

export const gameResolvers = {
    Query: {
        games: async (parent, args) => {
            try {
                let query = 'SELECT * FROM games WHERE 1=1';
                let countQuery = 'SELECT COUNT(*) as total FROM games WHERE 1=1';
                const params = [];
                const countParams = [];

                if (args.title) {
                    query += ' AND title LIKE ?';
                    countQuery += ' AND title LIKE ?';
                    params.push(`%${args.title}%`);
                    countParams.push(`%${args.title}%`);
                }

                if (args.limit) {
                    query += ' LIMIT ?';
                    params.push(args.limit);
                }

                if (args.offset) {
                    query += ' OFFSET ?';
                    params.push(args.offset);
                }

                const [rows] = await db.query(query, params);
                const [[{ total }]] = await db.query(countQuery, countParams);

                return {
                    games: rows.map(game => ({
                        ...game,
                        release_date: game.release_date ? game.release_date.toISOString().split('T')[0] : null
                    })),
                    totalCount: total,
                    hasNextPage: total > (args.offset ? args.offset : 0) + (args.limit ? args.limit : 0)
                }
            } catch (error) {
                console.error('Error fetching game data:', error);
                throw new Error('Failed to fetch game data');
            }
        },

        game: async (parent, args) => {
            try {
                const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [args.id]);
                if (rows.length === 0) {
                    return null;
                }
                return rows[0];
            } catch (error) {
                console.error('Error fetching game by ID:', error);
                throw new Error('Failed to fetch game by ID');
            }
        }
    },

    Mutation: {
        createGame: async (parent, args) => {
            try {
                const [result] = await db.query(`
                    INSERT INTO games (title, release_date, metascore, userscore, description, developer, publisher)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    args.title,
                    args.release_date ?? null,
                    args.metascore ?? null,
                    args.userscore ?? null,
                    args.description ?? null,
                    args.developer ?? null,
                    args.publisher ?? null
                ]);

                return { id: result.insertId, ...args };
            } catch (error) {
                console.error('Error creating game:', error);
                throw new Error('Failed to create game');
            }
        },

        // not optimal but it works for now, will refactor later
        updateGame: async (parent, args) => {
            try {
                const fields = [];
                const params = [];

                if (args.title) {
                    fields.push('title = ?');
                    params.push(args.title);
                }

                if (args.release_date) {
                    fields.push('release_date = ?');
                    params.push(args.release_date);
                }

                if (args.metascore) {
                    fields.push('metascore = ?');
                    params.push(args.metascore);
                }

                if (args.userscore) {
                    fields.push('userscore = ?');
                    params.push(args.userscore);
                }

                if (args.description) {
                    fields.push('description = ?');
                    params.push(args.description);
                }

                if (args.developer) {
                    fields.push('developer = ?');
                    params.push(args.developer);
                }

                if (args.publisher) {
                    fields.push('publisher = ?');
                    params.push(args.publisher);
                }

                if (args.platformIds) {
                    for (const platformId of args.platformIds) {
                        await db.query('INSERT IGNORE INTO game_platforms (game_id, platform_id) VALUES (?, ?)', [args.id, platformId]);
                        const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [args.id]);
                        return rows[0];
                    }
                }

                if (args.genreIds) {
                    for (const genreId of args.genreIds) {
                        await db.query('INSERT IGNORE INTO game_genres (game_id, genre_id) VALUES (?, ?)', [args.id, genreId]);
                        const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [args.id]);
                        return rows[0];
                    }
                }

                if (fields.length === 0) {
                    return null;
                }

                params.push(args.id);

                await db.query(`UPDATE games SET ${fields.join(', ')} WHERE id = ?`, params);

                const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [args.id]);
                return rows[0];
            } catch (error) {
                console.error('Error updating game:', error);
                throw new Error('Failed to update game');
            }
        },

        deleteGame: async (parent, args) => {
            try {
                await db.query('DELETE FROM game_genres WHERE game_id = ?', [args.id]);
                await db.query('DELETE FROM game_platforms WHERE game_id = ?', [args.id]);
                const [result] = await db.query('DELETE FROM games WHERE id = ?', [args.id]);
                return {
                    success: result.affectedRows > 0,
                    message: result.affectedRows > 0 ? 'Game deleted successfully' : 'Game not found'
                }
            } catch (error) {
                console.error('Error deleting game:', error);
                throw new Error('Failed to delete game');
            }
        }
    },

    Game: {
        genres: async (parent) => {
            try {
                const [rows] = await db.query(`
                        SELECT genres.*
                        FROM genres
                        JOIN game_genres ON genres.id = game_genres.genre_id
                        WHERE game_genres.game_id = ?
                    `, [parent.id]);
                return rows;
            } catch (error) {
                console.error('Error fetching genre data for game:', error);
                throw new Error('Failed to fetch genre data for game');
            }
        },

        platforms: async (parent) => {
            try {
                const [rows] = await db.query(`
                        SELECT platforms.*
                        FROM platforms
                        JOIN game_platforms ON platforms.id = game_platforms.platform_id
                        WHERE game_platforms.game_id = ?
                    `, [parent.id]);
                return rows;
            } catch (error) {
                console.error('Error fetching platform data for game:', error);
                throw new Error('Failed to fetch platform data for game');
            }
        }
    }
};

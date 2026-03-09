import { db } from "../config/db.js"

export const gameResolvers = {
    Query: {
        games: async (parent, args) => {
            try {
                let query = 'SELECT * FROM games WHERE 1=1';
                const params = [];

                if (args.title) {
                    query += ' AND title LIKE ?';
                    params.push(`%${args.title}%`);
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
                return rows.map(game => ({
                    ...game,
                    release_date: game.release_date ? game.release_date.toISOString().split('T')[0] : null
                }));
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

import { db } from "../config/db.js"

export const gameResolvers = {
    Query: {
        games: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM games');
                return rows.map(game => ({
                    ...game,
                    release_date: game.release_date ? game.release_date.toISOString().split('T')[0] : null
                }));
            } catch (error) {
                console.error('Error fetching game data:', error);
                throw new Error('Failed to fetch game data');
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

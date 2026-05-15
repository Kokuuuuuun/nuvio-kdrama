/**
 * Test script for the Vimeus provider
 * Usage:
 *   node test-vimeus.js movie 550          → Fight Club
 *   node test-vimeus.js tv 1399 1 1        → Game of Thrones S01E01
 *   node test-vimeus.js tv 46261 1 1       → Attack on Titan S01E01
 */

const { getStreams } = require('./providers/vimeus.js');

const [, , mediaTypeArg, tmdbIdArg, seasonArg, episodeArg] = process.argv;

const mediaType = mediaTypeArg || 'movie';
const tmdbId    = tmdbIdArg    || '550';
const season    = seasonArg    || '1';
const episode   = episodeArg   || '1';

console.log('\n=== Vimeus Provider Test ===');
console.log(`Type: ${mediaType} | TMDB: ${tmdbId} | S${season}E${episode}\n`);

getStreams(tmdbId, mediaType, season, episode).then(streams => {
    if (!streams || streams.length === 0) {
        console.log('❌ No streams returned.');
        process.exit(1);
    }

    console.log(`\n✅ ${streams.length} stream(s) found:\n`);
    streams.forEach((s, i) => {
        console.log(`  [${i + 1}] ${s.title}`);
        console.log(`       URL: ${s.url.substring(0, 90)}...`);
        if (s.headers) {
            const keys = Object.keys(s.headers);
            if (keys.length) console.log(`       Headers: ${keys.join(', ')}`);
        }
        console.log();
    });
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

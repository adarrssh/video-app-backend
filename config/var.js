module.exports = {
    domain : process.env.IS_PROD === 'true' ?  ['https://stream-your-video.netlify.app','https://stream-dev.netlify.app'] : ['http://localhost:3000']
}
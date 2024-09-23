// const { Command } = require('commander');
// const { downloadLiveStream } = require('./helpers/downloadLiveStream');

// const program = new Command()

// program
//   .argument('<username>', 'Username of tiktok user')
//   .description('Download tiktok live stream')
//   .option(
//     '-o, --output [path]',
//     `Output file or folder path (eg ./folder or ./folder/file.mp4)`,
//     `downloads`
//   )
//   .option('-f, --format <format>', 'Output formats valid mp4 and mkv', 'mp4')
//   .option('-d, --debug', 'output extra debugging')
//   .action((username, options) => {
//     const { output, format } = options

//     console.info(`\n✅ Searching user's live stream: ${username}`)
//     console.info(`💾 Output directory: ${output}`)
//     console.info(`📹 Format video: ${format}\n`)

//     downloadLiveStream(username, output, format).catch((err) => {
//       console.error(err)
//       process.exit(1)
//     })
//   })

// program.parse(process.argv)

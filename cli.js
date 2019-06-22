#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const cli = require('@ianwalter/cli')
const { print } = require('@ianwalter/print')
const execa = require('execa')
const { source } = require('common-tags')

async function run () {
  const { _: [command, ...rest] } = cli({ name: 'houston' })

  if (command === 'install') {
    //
    const secret = rest[0]

    //
    if (!secret) {
      print.error(
        `You must specify a secret as a parameter to the install command.`
      )
      process.exit(1)
    }

    //
    const socketFile = path.join(__dirname, 'houston.socket')
    await fs.copyFile(socketFile, '/etc/systemd/system/houston.socket')

    //
    await fs.writeFile('/etc/systemd/system/houston.service', source`
      [Service]
      ExecStart=/usr/bin/houston serve
      Environment="HOUSTON_SECRET=${secret}"
    `)

    //
    await execa('systemctl --system daemon-reload')

    //
    await execa('systemctl enable houston.socket')

    print.success('houston systemd configuration installed!')
  } else if (command === 'serve') {
    require('./server')
  }
}

run().catch(err => print.error(err))

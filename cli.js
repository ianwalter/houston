#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const cli = require('@ianwalter/cli')
const { print } = require('@ianwalter/print')
const execa = require('execa')

async function run () {
  const { _: [command] } = cli({ name: 'houston' })

  if (command === 'install') {
    //
    const socketFile = path.join(__dirname, 'houston.socket')
    await fs.copyFile(socketFile, '/etc/systemd/system/houston.socket')

    //
    const serviceFile = path.join(__dirname, 'houston.service')
    await fs.copyFile(serviceFile, '/etc/systemd/system/houston.service')

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

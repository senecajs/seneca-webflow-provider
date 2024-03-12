/* Copyright © 2022 Seneca Project Contributors, MIT License. */


const messages = {
  get_info: {
    desc: 'Get information about the Webflow SDK.',
  },
}


const sections = {
  intro: {
    path: '../provider/doc/intro.md'
  }
}

const docs = {
  sections,
  messages
}

export default docs


if ('undefined' !== typeof module) {
  module.exports = docs
}

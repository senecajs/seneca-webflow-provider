/* Copyright © 2022 Seneca Project Contributors, MIT License. */


const messages = {

  get_info: {
    desc: 'Get information about the Tangocard SDK.',
  },

}


const sections = {
  intro: {
    path: '../provider/doc/intro.md'
  }
}

export default {
  sections,
  messages
}

if ('undefined' !== typeof (module)) {
  module.exports = docs
}

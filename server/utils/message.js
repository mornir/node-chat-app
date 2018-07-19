const generateMessage = (from, text) => {
  return { from, text, createAt: new Date().getTime() }
}

const generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    createAt: new Date().getTime(),
  }
}

module.exports = { generateMessage, generateLocationMessage }

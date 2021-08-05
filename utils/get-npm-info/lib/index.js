'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null
  }
  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registryUrl, npmName)

  return axios.get(npmInfoUrl)
    .then(response => {
      if (response.status === 200) {
        return response.data
      }
      return null
    })
    .catch((error) => {
      return Promise().reject(error)
    })
}

function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'http://registry.npmjs.org' : 'http://registry.npm.taobao.org'
}

async function getNpmVersions(npmName) {
  const data = await getNpmInfo(npmName)

  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gte(b, a))
}

async function getNpmSemverVersions(baseVersion, npmName, registry ) {
  const versions = await getNpmVersions(npmName)
  const newVersions = getSemverVersions(baseVersion, versions)

  if (newVersions && newVersions.length > 0) {
    return newVersions[0]
  } else {
    return null
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getSemverVersions,
  getNpmSemverVersions
}

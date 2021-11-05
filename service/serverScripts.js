import {api_url} from '../config/config';

export async function getServerScripts(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/scripts', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = await request.json();
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function createServerScript(
  api_key,
  slug,
  scriptId,
  path,
  makeScriptExecutable,
  executeImmediately,
) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/scripts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        scriptId: scriptId,
        path: path,
        makeScriptExecutable: makeScriptExecutable,
        executeImmediately: executeImmediately,
      }),
    });
    let result = {status: request.status, response: await request.json()};

    console.log(result);

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

export async function getServerScriptById(api_key, slug, scriptId) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/scripts/' + scriptId,
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + api_key,
        },
      },
    );
    let result = await request.json();
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

export async function deleteServerScript(api_key, slug, scriptId) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/scripts/' + scriptId,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
      },
    );
    let result = await request.status;
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

export async function executeServerScript(api_key, slug, scriptId) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/scripts/' + scriptId + '/execute',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
      },
    );
    let result = {status: request.status};
    console.log(result);
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function fetchesAFileFromTheServer(api_key, slug, filePath) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/fetchFile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        filePath: filePath,
      }),
    });
    let result = {status: await request.status, response: await request.json()};

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

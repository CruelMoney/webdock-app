import {api_url} from '../config/config';

export async function getAccountScripts(api_key) {
  try {
    let request = await fetch(api_url + 'account/scripts', {
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
export async function postAccountScripts(api_key, name, filename, filecontent) {
  try {
    let request = await fetch(api_url + 'account/scripts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        name: name,
        filename: filename,
        content: filecontent,
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
export async function patchAccountScripts(
  api_key,
  id,
  name,
  filename,
  filecontent,
) {
  try {
    let request = await fetch(api_url + 'account/scripts/' + id, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        name: name,
        filename: filename,
        content: filecontent,
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

export async function deleteAccountScript(api_key, scriptId) {
  try {
    let request = await fetch(api_url + 'account/scripts/' + scriptId, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = await request.status;
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

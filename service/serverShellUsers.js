import {api_url} from '../config/config';

export async function getServerShellUsers(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/shellUsers', {
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
export async function createShellUser(
    api_key,
    slug,
    username,
    password,
    group,
    shell,
    publicKeys
  ) {
    try {
      let request = await fetch(api_url + 'servers/' + slug + '/shellUsers', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          username: username,
          password: password,
          group: group,
          shell: shell,
          publicKeys: publicKeys
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

export async function deleteServerShellUsers(api_key, slug, shellUsersId) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug +"/shellUsers/"+ shellUsersId,
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

export async function updateShellUserPublicKeys(
    api_key,
    slug,
    shellUsersId,
    publicKeys
  ) {
    try {
      console.log(publicKeys)
      let request = await fetch(api_url + 'servers/' + slug + '/shellUsers/' + shellUsersId, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          publicKeys: publicKeys
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

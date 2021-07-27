import {api_url} from '../config/config';

export async function getAccountPublicKeys(api_key) {
  try {
    let request = await fetch(api_url + 'account/publicKeys', {
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
export async function postAccountPublicKeys(api_key, keyname, publickey) {
  try {
    let request = await fetch(api_url + 'account/publicKeys', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        name: keyname,
        publicKey: publickey,
      }),
    });
    console.log(request);
    let result = await request.json();
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

export async function deleteAccountPublicKey(api_key, id) {
  try {
    let request = await fetch(api_url + 'account/publicKeys/' + id, {
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

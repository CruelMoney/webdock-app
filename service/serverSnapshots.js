import {api_url} from '../config/config';

export async function getServerSnapshots(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/snapshots', {
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

export async function deleteServerSnapshot(api_key, slug, snapshotId) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/snapshots/' + snapshotId,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
      },
    );
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status};
    }else{
      result = {status: request.status, headers: request.headers}
    }
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

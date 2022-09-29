import {api_url} from '../config/config';

export async function startServer(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/actions/start', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }else{
      result = {status: request.status, headers: request.headers}
    }

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function stopServer(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/actions/stop', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }else{
      result = {status: request.status, headers: request.headers}
    }

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function rebootServer(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/actions/reboot', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }else{
      result = {status: request.status, headers: request.headers}
    }

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

export async function suspendServer(api_key, slug) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/actions/suspend',
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
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }else{
      result = {status: request.status, headers: request.headers}
    }
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function restoreFromSnapshot(api_key, slug,snapshot_Id) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/actions/restore',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          snapshotId:snapshot_Id
        }),
      },
    );
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function createSnapshotForServer(api_key, slug,name) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/actions/snapshot',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          name:name
        }),
      },
    );
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function dryRunForServerProfileChange(api_key, slug,profileSlug) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/actions/resize/dryrun',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          profileSlug:profileSlug
        }),
      },
    );
    let result = {status: request.status, response: await request.json()};
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function changeServerProfile(api_key, slug,profileSlug) {
  try {
    let request = await fetch(
      api_url + 'servers/' + slug + '/actions/resize',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          profileSlug:profileSlug
        }),
      },
    );
    let result = {status: request.status};
    if (result.status != 202) {
      result = {status: request.status, response: await request.json()};
    }
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}


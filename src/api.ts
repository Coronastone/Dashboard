async function sendAsync(url: string, method: string, data?: any) {
    return await fetch(url, {
        body: data === undefined ? null : JSON.stringify(data),
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
        },
        method: method,
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer', // *client, no-referrer
    });
}

async function parseAsync(response: Response) {
    if (!response.ok) {
        throw new Error(`${response.status}`);
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function deleteAsync(url: string) {
    const response = await sendAsync(url, 'DELETE');

    return await parseAsync(response);
}

async function getAsync(url: string) {
    const response = await sendAsync(url, 'GET');

    return await parseAsync(response);
}

async function postAsync(url: string, data: any) {
    const response = await sendAsync(url, 'POST', data);

    return await parseAsync(response);
}

async function putAsync(url: string, data: any) {
    const response = await sendAsync(url, 'PUT', data);

    return await parseAsync(response);
}

export { deleteAsync, getAsync, postAsync, putAsync };

async function sendAsync(url: string, method: string, data?: any, signal?: AbortSignal) {
    try {
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
            signal: signal,
        });
    } catch (e) {
        if (e.name === 'AbortError') {
            return null;
        } else {
            throw e;
        }
    }
}

async function parseAsync(response: Response | null) {
    if (response === null) return null;

    if (!response.ok) {
        throw new Error(`${response.status}`);
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function deleteAsync(url: string, signal?: AbortSignal) {
    const response = await sendAsync(url, 'DELETE', undefined, signal);

    return await parseAsync(response);
}

async function getAsync(url: string, signal?: AbortSignal) {
    const response = await sendAsync(url, 'GET', undefined, signal);

    return await parseAsync(response);
}

async function postAsync(url: string, data?: any, signal?: AbortSignal) {
    const response = await sendAsync(url, 'POST', data, signal);

    return await parseAsync(response);
}

async function putAsync(url: string, data?: any, signal?: AbortSignal) {
    const response = await sendAsync(url, 'PUT', data, signal);

    return await parseAsync(response);
}

export { deleteAsync, getAsync, postAsync, putAsync };

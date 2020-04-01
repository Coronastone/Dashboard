interface Role {
    id: number;
    name: string;
    title: string;
    created_at: string;
}

interface User {
    id: number;
    username: string;
    password?: string;
    name: string;
    deleted_at: string;
    created_at: string;
    roles: Array<Role>;
}

export type { Role, User };

interface Loading {
    loading?: boolean;
}

interface Ability extends Loading {
    id: number;
    name: string;
    title: string;
    built_in: boolean;
    created_at: string;
}

interface Role extends Loading {
    id: number;
    name: string;
    title: string;
    created_at: string;
    abilities: Array<Ability>;
}

interface User extends Loading {
    id: number;
    username: string;
    password?: string;
    name: string;
    deleted_at: string;
    created_at: string;
    roles: Array<Role>;
}

export type { Ability, Role, User };

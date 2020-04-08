interface Ability {
    id: number;
    name: string;
    title: string;
    built_in: boolean;
    created_at: string;
}

interface Role {
    id: number;
    name: string;
    title: string;
    created_at: string;
    abilities: Array<Ability>;
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

export type { Ability, Role, User };

export type ServerConfig = {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
};

export const SERVERS: ServerConfig[] = [
    {
        id: "bali-websmith",
        name: "Bali Websmith",
        url: "https://server.bali-websmith.web.id/api/4/all",
        username: "virgananta",
        password: "N64kak933",
    },
    {
        id: "divloo-store",
        name: "Divloo Store",
        url: "https://monitor.divloo.store/api/4/all",
        username: "admin",
        password: "N64kak933",
    },
];

export function getServerById(id: string): ServerConfig | undefined {
    return SERVERS.find((s) => s.id === id);
}

export function getDefaultServer(): ServerConfig {
    return SERVERS[0];
}

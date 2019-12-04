export interface IMigration {
    run(): Promise<void>;
}

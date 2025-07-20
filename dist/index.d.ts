interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null;
    language: string | null;
    default_branch: string;
}
declare class GitHubCodeAnalyzer {
    private octokit;
    private owner;
    private patternAnalyzer;
    constructor(token: string, owner: string);
    getPersonalRepositories(): Promise<GitHubRepo[]>;
    analyzeRepository(repoName: string): Promise<any>;
    private analyzeCodingPatterns;
    private mergePatterns;
}
export default GitHubCodeAnalyzer;

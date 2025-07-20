"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
const dotenv = __importStar(require("dotenv"));
const PatternAnalyzer_1 = require("./analyzers/PatternAnalyzer");
dotenv.config();
class GitHubCodeAnalyzer {
    constructor(token, owner) {
        this.octokit = new rest_1.Octokit({ auth: token });
        this.owner = owner;
        this.patternAnalyzer = new PatternAnalyzer_1.PatternAnalyzer();
    }
    async getPersonalRepositories() {
        try {
            const { data } = await this.octokit.repos.listForUser({
                username: this.owner,
                type: 'owner',
                sort: 'updated',
                per_page: 100
            });
            // Map API response to GitHubRepo interface, handling undefined values
            return data.map(repo => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private,
                description: repo.description ?? null,
                language: repo.language ?? null,
                default_branch: repo.default_branch || 'main' // Provide default value for required field
            }));
        }
        catch (error) {
            console.error('Error fetching repositories:', error);
            return [];
        }
    }
    async analyzeRepository(repoName) {
        try {
            // Get repository contents
            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: repoName,
                path: ''
            });
            const contents = Array.isArray(response.data) ? response.data : [response.data];
            // Analyze coding patterns
            const patterns = await this.analyzeCodingPatterns(repoName, contents);
            return patterns;
        }
        catch (error) {
            console.error(`Error analyzing repository ${repoName}:`, error);
            return null;
        }
    }
    async analyzeCodingPatterns(repoName, contents) {
        const patterns = {
            fileStructure: {},
            namingConventions: {},
            commonPatterns: {},
            dependencies: {}
        };
        for (const item of contents) {
            if (item.type === 'file') {
                try {
                    // Analyze file content
                    const response = await this.octokit.repos.getContent({
                        owner: this.owner,
                        repo: repoName,
                        path: item.path,
                        mediaType: {
                            format: 'raw'
                        }
                    });
                    const fileContent = typeof response.data === 'string' ? response.data : '';
                    // Extract patterns from file content
                    const filePatterns = this.patternAnalyzer.analyzeFile(fileContent);
                    this.mergePatterns(patterns, filePatterns);
                }
                catch (error) {
                    console.error(`Error analyzing file ${item.path}:`, error);
                    continue;
                }
            }
        }
        return patterns;
    }
    mergePatterns(target, source) {
        for (const key in source) {
            if (Array.isArray(source[key])) {
                if (!target[key])
                    target[key] = [];
                target[key].push(...source[key]);
            }
            else if (typeof source[key] === 'object') {
                if (!target[key])
                    target[key] = {};
                this.mergePatterns(target[key], source[key]);
            }
            else {
                if (typeof target[key] === 'number' && typeof source[key] === 'number') {
                    target[key] = (target[key] + source[key]) / 2;
                }
                else {
                    target[key] = source[key];
                }
            }
        }
    }
}
// Export the analyzer
exports.default = GitHubCodeAnalyzer;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMultipleReposPatterns = analyzeMultipleReposPatterns;
exports.generateCodeSample = generateCodeSample;
const PatternAnalyzer_1 = require("./src/analyzers/PatternAnalyzer");
const CodeGenerator_1 = require("./src/generators/CodeGenerator");
const rest_1 = require("@octokit/rest");
const openai_1 = __importDefault(require("openai"));
async function analyzeMultipleReposPatterns(token, username, maxRepos = 10, analysisDepth = 'detailed') {
    const octokit = new rest_1.Octokit({ auth: token });
    const repos = await octokit.repos.listForUser({
        username,
        per_page: maxRepos,
    });
    const analyzer = new PatternAnalyzer_1.PatternAnalyzer();
    for (const repo of repos.data) {
        const contents = await octokit.repos.getContent({
            owner: username,
            repo: repo.name,
            path: '',
        });
        const files = contents.data;
        for (const file of Array.isArray(files) ? files : []) {
            if (file.type === 'file' && file.name.endsWith('.ts')) {
                const fileRes = await octokit.repos.getContent({
                    owner: username,
                    repo: repo.name,
                    path: file.path,
                });
                const content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
                analyzer.feed(content, analysisDepth);
            }
        }
    }
    return analyzer.getStyle();
}
async function generateCodeSample(style, spec, openaiKey) {
    const openai = new openai_1.default({ apiKey: openaiKey });
    const generator = new CodeGenerator_1.CodeGenerator(openai, style);
    return await generator.generateCode({ spec, style });
}

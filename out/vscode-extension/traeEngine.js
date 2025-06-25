"use strict";
// File: traeEngine.ts
// Wrapper logic for TRAE AI to fetch GitHub repo and run pattern analysis + code generation
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeSample = exports.analyzeRepoPatterns = void 0;
const rest_1 = require("@octokit/rest");
const PatternAnalyzer_1 = require("../src/analyzers/PatternAnalyzer");
const CodeGenerator_1 = require("../src/generators/CodeGenerator");
async function analyzeRepoPatterns(repoUrl, token) {
    const octokit = new rest_1.Octokit({ auth: token });
    const [_, owner, repo] = repoUrl.match(/github.com[/:](.+?)\/(.+?)(\.git)?$/i) || [];
    if (!owner || !repo)
        throw new Error('Invalid GitHub repo URL');
    const files = await listRepoFiles(octokit, owner, repo);
    const codeFiles = files.filter((file) => file.path.endsWith('.ts') || file.path.endsWith('.js'));
    const analyzer = new PatternAnalyzer_1.PatternAnalyzer();
    const patterns = [];
    for (const file of codeFiles.slice(0, 10)) {
        const content = await fetchFileContent(octokit, owner, repo, file.path);
        const result = analyzer.analyzeFile(content);
        if (result)
            patterns.push(result);
    }
    return mergePatterns(patterns);
}
exports.analyzeRepoPatterns = analyzeRepoPatterns;
async function generateCodeSample(patterns, spec, openaiKey) {
    const generator = new CodeGenerator_1.CodeGenerator(openaiKey, {
        namingStyle: {
            variables: patterns.namingConventions?.variables || 'camelCase',
            functions: patterns.namingConventions?.functions || 'camelCase',
            classes: patterns.namingConventions?.classes || 'PascalCase',
        },
        codeStyle: {
            indentation: patterns.commonPatterns?.indentationStyle || '2 spaces',
            lineSpacing: patterns.commonPatterns?.lineSpacing || 1,
            commentStyle: patterns.commonPatterns?.commentStyle || 'single_line',
        },
        structuralPreferences: {
            functionLength: patterns.fileStructure?.functions?.[0]?.length || 20,
            errorHandlingStyle: patterns.commonPatterns?.errorHandling || 'try-catch',
            classStructure: 'modular',
        },
        preferredDependencies: {
            frameworks: patterns.dependencies?.frameworks || [],
            libraries: patterns.dependencies?.libraries || [],
        },
    });
    return generator.generateCode(spec);
}
exports.generateCodeSample = generateCodeSample;
async function listRepoFiles(octokit, owner, repo) {
    const tree = await octokit.repos.getCommit({ owner, repo, ref: 'HEAD' });
    const sha = tree.data.commit.tree.sha;
    const treeResp = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: sha,
        recursive: '1',
    });
    return treeResp.data.tree.filter((f) => f.type === 'blob');
}
async function fetchFileContent(octokit, owner, repo, path) {
    const file = await octokit.repos.getContent({ owner, repo, path });
    const content = file.data.content;
    return Buffer.from(content, 'base64').toString('utf-8');
}
function mergePatterns(patternList) {
    const merged = {};
    for (const pattern of patternList) {
        for (const key in pattern) {
            if (!(key in merged)) {
                merged[key] = pattern[key];
            }
            else if (typeof pattern[key] === 'object' &&
                typeof merged[key] === 'object') {
                merged[key] = { ...merged[key], ...pattern[key] };
            }
        }
    }
    return merged;
}

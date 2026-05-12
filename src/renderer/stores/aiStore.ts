import { create } from 'zustand';
import { ChatMessage, AgentAction } from '@shared/types';

export interface TokenUsageEntry {
  id: string;
  model: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  timestamp: number;
}

function ollamaErrorMsg(status: number, model: string): string {
  if (status === 404) {
    return `Model "${model}" not found. Pull it with: ollama pull ${model}`;
  }
  return `Ollama error: ${status}`;
}

const TOKEN_USAGE_KEY = 'ultimate-editor-token-usage';

function loadTokenUsage(): TokenUsageEntry[] {
  try {
    const raw = localStorage.getItem(TOKEN_USAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTokenUsage(entries: TokenUsageEntry[]): void {
  try {
    localStorage.setItem(TOKEN_USAGE_KEY, JSON.stringify(entries));
  } catch { /* ignore */ }
}

export const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  plan: 'You are a senior software architect. You have access to tools for reading files and running commands. Use read_file to examine existing code before planning. Given a task, produce a detailed step-by-step plan. Be specific with file paths, architecture decisions, and rationale. Do NOT write final code — focus on design and strategy. Use markdown for structure.',
  build: 'You are a coding agent. You have access to tools for reading/writing files and running commands. Use write_file to create or modify files, and run_command to install dependencies or run builds. Follow the user\'s instructions precisely and do exactly what is asked — no more, no less. Use the tools to accomplish tasks rather than just suggesting code. Be specific with file paths.',
  debug: 'You are a debugging expert. You have access to tools for reading files and running commands. Use read_file to examine source code and logs, and run_command to run tests or reproduce issues. Given an issue description, analyze the root cause methodically, propose specific fixes, and use write_file to apply fixes when appropriate. Include reproduction steps.',
  analyze: 'You are a code reviewer. You have access to tools for reading files and running commands. Use read_file to examine code, run_command to run linting or tests. Given code or a feature request, analyze it for correctness, performance, security, and maintainability. Provide specific recommendations with before/after code examples.',
  refactor: 'You are a code refactoring specialist. You have access to tools for reading/writing files and running commands. Use read_file to understand the existing codebase, then use write_file to apply refactoring changes. Focus on reducing complexity, improving readability, eliminating duplication, and applying design patterns. Make the changes directly using your tools.',
  review: 'You are a thorough code reviewer. You have access to tools for reading files and running commands. Use read_file to examine the code in detail, and run_command to run tests or linters. Analyze the code for bugs, performance issues, security vulnerabilities, and maintainability concerns. Provide specific, actionable feedback.',
  document: 'You are a technical writer. You have access to tools for reading/writing files. Use read_file to examine the code or feature, then use write_file to create or update documentation files (READMEs, API docs, inline comments). Generate clear, comprehensive documentation with usage examples and configuration options.',
  test: 'You are a testing expert. You have access to tools for reading/writing files and running commands. Use read_file to understand existing code and test patterns, write_file to create test files, and run_command to execute tests. Generate comprehensive unit/integration tests covering edge cases, error paths, and happy paths.',
  search: 'You are a code search specialist. You have access to tools for reading files and running commands. Use read_file to examine relevant files and run_command to search for patterns (grep, findstr). Given a query, find relevant code, understand its context, and report what you found with file paths and line numbers.',
};

export const BUILTIN_PROMPT_IDS = ['plan', 'build', 'debug', 'analyze', 'refactor', 'review', 'document', 'test', 'search'] as const;

export const DEFAULT_CUSTOM_PROMPTS: SavedPrompt[] = [
  { id: 'prompt-code-review', name: 'Code Reviewer', content: 'You are a thorough code reviewer. Analyze the given code for bugs, performance issues, security vulnerabilities, and maintainability concerns. Provide specific, actionable feedback with code examples for each issue found. Prioritize by severity.' },
  { id: 'prompt-test-gen', name: 'Test Generator', content: 'You are a testing expert. Generate comprehensive unit tests for the given code. Cover edge cases, error paths, and happy paths. Use the same testing framework and conventions as the existing codebase. Include mock setups where needed.' },
  { id: 'prompt-commit-msg', name: 'Commit Writer', content: 'You are a git expert. Given the provided diff or description, write a concise conventional commit message. Follow the format: type(scope): description. Types: feat, fix, refactor, test, docs, chore. Keep the subject under 72 characters.' },
  { id: 'prompt-api-design', name: 'API Designer', content: 'You are an API architect. Design RESTful or GraphQL API endpoints following best practices. Specify HTTP methods, request/response schemas, status codes, authentication requirements, and error handling. Consider pagination, rate limiting, and versioning.' },
  { id: 'prompt-db-design', name: 'DB Schema Designer', content: 'You are a database architect. Design database schemas with proper normalization, indexes, constraints, and relationships. Consider query patterns, data types, migration strategies, and performance implications. Include SQL or ORM definitions.' },
  { id: 'prompt-refactor', name: 'Refactoring Advisor', content: 'You are a code quality expert. Suggest refactoring improvements for the given code. Focus on reducing complexity, improving readability, eliminating duplication, and applying design patterns. Provide before/after code examples and explain the benefits of each change.' },
  { id: 'prompt-docs', name: 'Docs Writer', content: 'You are a technical writer. Generate clear, comprehensive documentation for the given code or feature. Include purpose, usage examples, API reference, edge cases, and configuration options. Use markdown formatting with appropriate headings and code blocks.' },
  { id: 'prompt-debug', name: 'Debugging Assistant', content: 'You are a debugging expert. Given an error message, stack trace, or bug description, systematically identify the root cause. Propose specific fixes with explanations. Include reproduction steps, verification commands, and preventative measures to avoid similar issues.' },
  { id: 'prompt-perf', name: 'Performance Optimizer', content: 'You are a performance engineer. Analyze the given code for performance bottlenecks. Suggest specific optimizations with before/after comparisons. Consider algorithmic complexity, memory usage, I/O patterns, caching strategies, and concurrency.' },
  { id: 'prompt-arch', name: 'Architecture Advisor', content: 'You are a software architect. Given a feature or system description, propose a high-level architecture. Consider design patterns, component boundaries, data flow, error handling, scalability, and technology choices. Provide diagrams using ASCII or mermaid if helpful.' },
];

export const TOOL_INSTRUCTIONS = `
You have access to tools for reading/writing files and running commands. Use them by outputting a code block with the appropriate format. After you use a tool, its result will be provided back to you so you can continue.

Available tools:

1. **write_file** - Create or overwrite a file. Use a code block whose first line is a comment with the file path:
\`\`\`
// path/to/file.ext
file content goes here
\`\`\`

2. **run_command** - Execute a shell command. Use a code block with the language set to bash, sh, shell, cmd, or powershell:
\`\`\`bash
your command here
\`\`\`

3. **read_file** - Read the contents of a file. Use a code block with language read_file:
\`\`\`read_file
path/to/file.ext
\`\`\`

IMPORTANT: Use tools step by step. After each tool use, continue based on the result. When the task is complete, provide a summary.`;

export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
}

const CUSTOM_PROMPTS_KEY = 'ultimate-editor-custom-prompts';

function loadCustomPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROMPTS_KEY);
    if (raw) return JSON.parse(raw);
    saveCustomPrompts(DEFAULT_CUSTOM_PROMPTS);
    return DEFAULT_CUSTOM_PROMPTS;
  } catch { return []; }
}

function saveCustomPrompts(prompts: SavedPrompt[]): void {
  try { localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(prompts)); } catch { /* ignore */ }
}

export interface OllamaConfig {
  enabled: boolean;
  host: string;
  port: number;
  model: string;
  availableModels: string[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string;
}

export type ApiProviderType =
  | '302ai' | 'abacus' | 'ai2' | 'ai21' | 'ai71'
  | 'aimlapi' | 'aionlabs' | 'akash' | 'alephalpha' | 'alibaba'
  | 'anthropic' | 'anyscale' | 'apple' | 'arcee' | 'assemblyai'
  | 'awsbedrock' | 'azureopenai' | 'baichuan' | 'baidu' | 'baseten'
  | 'bergetai' | 'blackforestlabs' | 'bytedance' | 'cartesia' | 'cerebras'
  | 'chutes' | 'clarifai' | 'cloudflare' | 'cohere' | 'compactifai'
  | 'contextual' | 'coreweave' | 'cortecs' | 'custom' | 'databricks'
  | 'dbrx' | 'deepgram' | 'deepinfra' | 'deepinfra2' | 'deepseek'
  | 'deepset' | 'deci' | 'eden' | 'elevenlabs' | 'ernie'
  | 'essentialai' | 'evroc' | 'fal' | 'featherless' | 'fireworks'
  | 'forefront' | 'friendli' | 'gencraft' | 'github' | 'gladia'
  | 'glean' | 'google' | 'gooey' | 'gradient' | 'groq'
  | 'h2o' | 'hive' | 'huggingface' | 'hyperbolic' | 'hyperbee'
  | 'hyperstack' | 'ibm' | 'ideogram' | 'inception' | 'infercom'
  | 'inflection' | 'intel' | 'ionet' | 'jan' | 'jasper'
  | 'jetbrains' | 'jina' | 'kapa' | 'kilogateway' | 'kobold'
  | 'kuaishou' | 'lambdalabs' | 'langchain' | 'leonardo' | 'lepton'
  | 'lg' | 'lightricks' | 'liquid' | 'llamaapi' | 'lmstudio'
  | 'localai' | 'luma' | 'magic' | 'marketplace' | 'mars'
  | 'meituan' | 'meta' | 'microsoft' | 'midjourney' | 'minimax'
  | 'mistral' | 'modal' | 'modelscope' | 'monadic' | 'monster'
  | 'moonshot' | 'morph' | 'muapi' | 'nanogpt' | 'nebulous'
  | 'nebius' | 'neoxa' | 'nitel' | 'nlpcloud' | 'nomic'
  | 'novita' | 'nscale' | 'nvidia' | 'oci' | 'octoai'
  | 'ollama' | 'openai' | 'opencode' | 'openrouter' | 'ovh'
  | 'palm' | 'paperspace' | 'perplexity' | 'phind' | 'photon'
  | 'pika' | 'poem' | 'poe' | 'polly' | 'portkey'
  | 'postgresml' | 'predictor' | 'prem' | 'privatemode' | 'proxy'
  | 'publicai' | 'qdrant' | 'qwen' | 'rapidapi' | 'recraft'
  | 'reka' | 'replicate' | 'requesty' | 'runway' | 'sambanova'
  | 'sarvam' | 'scale' | 'scalability' | 'scaleway' | 'sglang'
  | 'siliconflow' | 'singularity' | 'snowflake' | 'spark' | 'stability'
  | 'stepfun' | 'synexa' | 'tabby' | 'tencent' | 'tensorix'
  | 'textcortex' | 'tgi' | 'together' | 'tokenmix' | 'triton'
  | 'truefoundry' | 'upstage' | 'v0' | 'vast' | 'vectara'
  | 'veniceai' | 'vercel' | 'vertex' | 'vivgrid' | 'vllm'
  | 'vultr' | 'wan' | 'watsonx' | 'wavespeedai' | 'weightsandbiases'
  | 'windsurf' | 'xai' | 'xiaomi' | 'xinference' | 'yandex'
  | 'zai' | 'zenmux' | 'zhipu' | 'zyphra';

export const PROVIDER_LABELS: Record<string, string> = {
  '302ai': '302.AI', abacus: 'Abacus.ai', ai2: 'Allen AI',
  ai21: 'AI21 Labs', ai71: 'AI71', aimlapi: 'AIMLAPI',
  aionlabs: 'Aion Labs', akash: 'Akash Network', alephalpha: 'Aleph Alpha',
  alibaba: 'Alibaba Cloud', anthropic: 'Anthropic', anyscale: 'Anyscale',
  apple: 'Apple Intelligence', arcee: 'Arcee AI', assemblyai: 'AssemblyAI',
  awsbedrock: 'AWS Bedrock', azureopenai: 'Azure OpenAI',
  baichuan: 'Baichuan AI', baidu: 'Baidu Cloud', baseten: 'Baseten',
  bergetai: 'Berget AI', blackforestlabs: 'Black Forest Labs',
  bytedance: 'ByteDance', cartesia: 'Cartesia', cerebras: 'Cerebras',
  chutes: 'Chutes', clarifai: 'Clarifai', cloudflare: 'Cloudflare Workers AI',
  cohere: 'Cohere', compactifai: 'CompactifAI', contextual: 'Contextual AI',
  coreweave: 'CoreWeave', cortecs: 'Cortecs AI', custom: 'Custom (OpenAI-compat)',
  databricks: 'Databricks', dbrx: 'Databricks DBRX', deepgram: 'Deepgram',
  deepinfra: 'DeepInfra', deepinfra2: 'DeepInfra', deepseek: 'DeepSeek',
  deepset: 'Deepset', deci: 'Deci AI', eden: 'Eden AI',
  elevenlabs: 'ElevenLabs', ernie: 'ERNIE (Baidu)',
  essentialai: 'Essential AI', evroc: 'Evroc', fal: 'Fal AI',
  featherless: 'Featherless AI', fireworks: 'Fireworks AI',
  forefront: 'Forefront', friendli: 'Friendli AI', gencraft: 'Gencraft',
  github: 'GitHub Models', gladia: 'Gladia', glean: 'Glean',
  google: 'Google AI Studio', gooey: 'Gooey AI', gradient: 'Gradient',
  groq: 'Groq', h2o: 'H2O.ai', hive: 'Hive AI',
  huggingface: 'Hugging Face', hyperbolic: 'Hyperbolic',
  hyperbee: 'Hyperbee AI', hyperstack: 'Hyperstack',
  ibm: 'IBM watsonx', ideogram: 'Ideogram', inception: 'Inception AI',
  infercom: 'Infercom', inflection: 'Inflection AI', intel: 'Intel',
  ionet: 'IO.net', jan: 'Jan.ai', jasper: 'Jasper AI',
  jetbrains: 'JetBrains AI', jina: 'Jina AI', kapa: 'Kapa AI',
  kilogateway: 'Kilo Gateway', kobold: 'Kobold AI', kuaishou: 'Kuaishou',
  lambdalabs: 'Lambda Labs', langchain: 'LangChain', leonardo: 'Leonardo AI',
  lepton: 'Lepton AI', lg: 'LG AI Research', lightricks: 'Lightricks',
  liquid: 'Liquid AI', llamaapi: 'Llama API', lmstudio: 'LM Studio',
  localai: 'LocalAI', luma: 'Luma AI', magic: 'Magic AI',
  marketplace: 'Marketplace AI', mars: 'Mars AI', meituan: 'Meituan',
  meta: 'Meta AI', microsoft: 'Microsoft', midjourney: 'Midjourney',
  minimax: 'MiniMax', mistral: 'Mistral AI', modal: 'Modal',
  modelscope: 'ModelScope', monadic: 'Monadic AI', monster: 'Monster API',
  moonshot: 'Moonshot AI', morph: 'Morph AI', muapi: 'Mu API',
  nanogpt: 'NanoGPT', nebulous: 'Nebulous AI', nebius: 'Nebius AI',
  neoxa: 'NeoXA', nitel: 'Nitel', nlpcloud: 'NLP Cloud',
  nomic: 'Nomic AI', novita: 'Novita AI', nscale: 'Nscale',
  nvidia: 'NVIDIA NIM', oci: 'Oracle OCI', octoai: 'OctoAI',
  ollama: 'Ollama', openai: 'OpenAI', opencode: 'OpenCode',
  openrouter: 'OpenRouter', ovh: 'OVHcloud', palm: 'Google PaLM',
  paperspace: 'Paperspace', perplexity: 'Perplexity', phind: 'Phind',
  photon: 'Photon AI', pika: 'Pika Labs', poem: 'Poem AI',
  poe: 'Poe (Quora)', polly: 'Polly AI', portkey: 'Portkey',
  postgresml: 'PostgresML', predictor: 'Predictor AI', prem: 'Prem AI',
  privatemode: 'Privatemode AI', proxy: 'Proxy AI', publicai: 'Public AI',
  qdrant: 'Qdrant', qwen: 'Qwen (Alibaba)', rapidapi: 'RapidAPI',
  recraft: 'Recraft AI', reka: 'Reka AI', replicate: 'Replicate',
  requesty: 'Requesty', runway: 'Runway ML', sambanova: 'SambaNova',
  sarvam: 'Sarvam AI', scale: 'Scale AI', scalability: 'Scalability AI',
  scaleway: 'Scaleway', sglang: 'SGLang', siliconflow: 'SiliconFlow',
  singularity: 'Singularity AI', snowflake: 'Snowflake Cortex',
  spark: 'Spark AI', stability: 'Stability AI', stepfun: 'StepFun',
  synexa: 'Synexa', tabby: 'Tabby', tencent: 'Tencent Cloud',
  tensorix: 'Tensorix', textcortex: 'TextCortex', tgi: 'Hugging Face TGI',
  together: 'Together AI', tokenmix: 'TokenMix', triton: 'Triton AI',
  truefoundry: 'TrueFoundry', upstage: 'Upstage', v0: 'v0 (Vercel)',
  vast: 'Vast.ai', vectara: 'Vectara', veniceai: 'Venice AI',
  vercel: 'Vercel AI SDK', vertex: 'Google Vertex AI', vivgrid: 'Vivgrid',
  vllm: 'vLLM', vultr: 'Vultr', wan: 'Wan AI',
  watsonx: 'IBM watsonx', wavespeedai: 'WaveSpeed AI',
  weightsandbiases: 'Weights & Biases', windsurf: 'Windsurf',
  xai: 'xAI', xiaomi: 'Xiaomi', xinference: 'Xorbits Inference',
  yandex: 'Yandex Cloud', zai: 'Z.AI', zenmux: 'Zenmux',
  zhipu: 'Zhipu AI', zyphra: 'Zyphra AI',
};

export const API_PROVIDER_DEFAULTS: Record<ApiProviderType, { endpoint: string; model: string }> = {
  '302ai': { endpoint: 'https://api.302.ai/v1', model: 'gpt-4o' },
  abacus: { endpoint: 'https://api.abacus.ai/v1', model: 'abacus-llm' },
  ai2: { endpoint: 'https://api.ai2.xyz/v1', model: 'olmo-2-32b' },
  ai21: { endpoint: 'https://api.ai21.com/studio/v1', model: 'jamba-1.5-large' },
  ai71: { endpoint: 'https://api.ai71.ai/v1', model: 'falcon-180b' },
  aimlapi: { endpoint: 'https://api.aimlapi.com/v1', model: 'gpt-4o' },
  aionlabs: { endpoint: 'https://api.aionlabs.ai/v1', model: 'aion-2.0' },
  akash: { endpoint: 'https://api.akash.network/v1', model: 'akash-llama-3-70b' },
  alephalpha: { endpoint: 'https://api.aleph-alpha.com/v1', model: 'luminous-base' },
  alibaba: { endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-max' },
  anthropic: { endpoint: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-6' },
  anyscale: { endpoint: 'https://api.endpoints.anyscale.com/v1', model: 'llama-3-70b' },
  apple: { endpoint: 'https://api.apple.com/v1', model: 'apple-intelligence' },
  arcee: { endpoint: 'https://api.arcee.ai/v1', model: 'arcee-trinity' },
  assemblyai: { endpoint: 'https://api.assemblyai.com/v1', model: 'assemblyai-nova' },
  awsbedrock: { endpoint: 'https://bedrock-runtime.us-east-1.amazonaws.com', model: 'claude-3-5-sonnet' },
  azureopenai: { endpoint: 'https://your-resource.openai.azure.com', model: 'gpt-4o' },
  baichuan: { endpoint: 'https://api.baichuan-ai.com/v1', model: 'baichuan-4' },
  baidu: { endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop', model: 'ernie-4-0' },
  baseten: { endpoint: 'https://api.baseten.co/v1', model: 'baseten-llm' },
  bergetai: { endpoint: 'https://api.berget.ai/v1', model: 'berget-llm' },
  blackforestlabs: { endpoint: 'https://api.blackforestlabs.ai/v1', model: 'flux-1-dev' },
  bytedance: { endpoint: 'https://api.bytedance.com/v1', model: 'doubao-pro' },
  cartesia: { endpoint: 'https://api.cartesia.ai/v1', model: 'cartesia-sonic' },
  cerebras: { endpoint: 'https://api.cerebras.ai/v1', model: 'llama-3.3-70b' },
  chutes: { endpoint: 'https://api.chutes.ai/v1', model: 'chutes-llm' },
  clarifai: { endpoint: 'https://api.clarifai.com/v2', model: 'gpt-oss-120b' },
  cloudflare: { endpoint: 'https://api.cloudflare.com/client/v4/ai', model: '@cf/meta/llama-3-8b' },
  cohere: { endpoint: 'https://api.cohere.com/v1', model: 'command-r-plus' },
  compactifai: { endpoint: 'https://api.compactifai.ai/v1', model: 'compactifai-llm' },
  contextual: { endpoint: 'https://api.contextual.ai/v1', model: 'contextual-llm' },
  coreweave: { endpoint: 'https://api.coreweave.com/v1', model: 'coreweave-llm' },
  cortecs: { endpoint: 'https://api.cortecs.ai/v1', model: 'cortecs-llm' },
  custom: { endpoint: 'http://localhost:11434/v1', model: 'custom-model' },
  databricks: { endpoint: 'https://dbc-xxx.cloud.databricks.com/serving-endpoints', model: 'databricks-meta-llama-3-1-70b' },
  dbrx: { endpoint: 'https://api.databricks.com/v1', model: 'dbrx-instruct' },
  deepgram: { endpoint: 'https://api.deepgram.com/v1', model: 'deepgram-nova-2' },
  deepinfra: { endpoint: 'https://api.deepinfra.com/v1', model: 'deepseek-r1' },
  deepinfra2: { endpoint: 'https://api.deepinfra.com/v1', model: 'meta-llama-3-70b' },
  deepseek: { endpoint: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  deepset: { endpoint: 'https://api.deepset.ai/v1', model: 'deepset-llm' },
  deci: { endpoint: 'https://api.deci.ai/v1', model: 'deci-lm-6b' },
  eden: { endpoint: 'https://api.edenai.run/v1', model: 'eden-llm' },
  elevenlabs: { endpoint: 'https://api.elevenlabs.io/v1', model: 'eleven_multilingual_v2' },
  ernie: { endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop', model: 'ernie-4-0' },
  essentialai: { endpoint: 'https://api.essential.ai/v1', model: 'essential-llm' },
  evroc: { endpoint: 'https://api.evroc.ai/v1', model: 'evroc-llm' },
  fal: { endpoint: 'https://fal.run/v1', model: 'fal-ai/stable-diffusion' },
  featherless: { endpoint: 'https://api.featherless.ai/v1', model: 'featherless-llm' },
  fireworks: { endpoint: 'https://api.fireworks.ai/inference/v1', model: 'accounts/fireworks/models/llama-v3p3-70b-instruct' },
  forefront: { endpoint: 'https://api.forefront.ai/v1', model: 'forefront-llm' },
  friendli: { endpoint: 'https://api.friendli.ai/v1', model: 'friendli-llm' },
  gencraft: { endpoint: 'https://api.gencraft.com/v1', model: 'gencraft-xl' },
  github: { endpoint: 'https://models.inference.ai.azure.com/v1', model: 'gpt-4o' },
  gladia: { endpoint: 'https://api.gladia.io/v1', model: 'gladia-transcribe' },
  glean: { endpoint: 'https://api.glean.com/v1', model: 'glean-llm' },
  google: { endpoint: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.0-flash' },
  gooey: { endpoint: 'https://api.gooey.ai/v2', model: 'gooey-ai' },
  gradient: { endpoint: 'https://api.gradient.ai/api', model: 'gradient-base' },
  groq: { endpoint: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  h2o: { endpoint: 'https://api.h2o.ai/v1', model: 'h2o-danube-3' },
  hive: { endpoint: 'https://api.hive.ai/v1', model: 'hive-llm' },
  huggingface: { endpoint: 'https://api-inference.huggingface.co/v1', model: 'meta-llama/Llama-3.1-8B' },
  hyperbolic: { endpoint: 'https://api.hyperbolic.xyz/v1', model: 'meta-llama-3-70b' },
  hyperbee: { endpoint: 'https://api.hyperbee.ai/v1', model: 'hyperbee-llm' },
  hyperstack: { endpoint: 'https://api.hyperstack.ai/v1', model: 'hyperstack-llm' },
  ibm: { endpoint: 'https://us-south.ml.cloud.ibm.com/ml/v1', model: 'ibm/granite-13b' },
  ideogram: { endpoint: 'https://api.ideogram.ai/v1', model: 'ideogram-v2' },
  inception: { endpoint: 'https://api.inceptionlabs.ai/v1', model: 'mercury-coder' },
  infercom: { endpoint: 'https://api.infercom.ai/v1', model: 'infercom-llm' },
  inflection: { endpoint: 'https://api.inflection.ai/v1', model: 'inflection-2-5' },
  intel: { endpoint: 'https://api.intel.com/v1', model: 'intel-neural-chat' },
  ionet: { endpoint: 'https://api.io.net/v1', model: 'ionet-llm' },
  jan: { endpoint: 'https://api.jan.ai/v1', model: 'jan-llm' },
  jasper: { endpoint: 'https://api.jasper.ai/v1', model: 'jasper-llm' },
  jetbrains: { endpoint: 'https://api.jetbrains.com/ai/v1', model: 'jetbrains-llm' },
  jina: { endpoint: 'https://api.jina.ai/v1', model: 'jina-embeddings-v3' },
  kapa: { endpoint: 'https://api.kapa.ai/v1', model: 'kapa-llm' },
  kilogateway: { endpoint: 'https://api.kilogateway.com/v1', model: 'kilogateway-llm' },
  kobold: { endpoint: 'https://api.koboldai.net/v1', model: 'kobold-llm' },
  kuaishou: { endpoint: 'https://api.kuaishou.com/v1', model: 'kling-video' },
  lambdalabs: { endpoint: 'https://api.lambdalabs.com/v1', model: 'lambda-llama-3-70b' },
  langchain: { endpoint: 'https://api.langchain.com/v1', model: 'langchain-llm' },
  leonardo: { endpoint: 'https://api.leonardo.ai/v1', model: 'leonardo-xl' },
  lepton: { endpoint: 'https://api.lepton.ai/v1', model: 'lepton-llama-3-70b' },
  lg: { endpoint: 'https://api.lgresearch.ai/v1', model: 'exaone-3.5' },
  lightricks: { endpoint: 'https://api.lightricks.com/v1', model: 'ltx-video' },
  liquid: { endpoint: 'https://api.liquid.ai/v1', model: 'lfm-40b' },
  llamaapi: { endpoint: 'https://api.llama-api.com/v1', model: 'llama-3-70b' },
  lmstudio: { endpoint: 'https://api.lmstudio.ai/v1', model: 'lmstudio-llm' },
  localai: { endpoint: 'https://api.localai.io/v1', model: 'localai-llm' },
  luma: { endpoint: 'https://api.lumalabs.ai/v1', model: 'luma-ray' },
  magic: { endpoint: 'https://api.magic.ai/v1', model: 'magic-llm' },
  marketplace: { endpoint: 'https://api.marketplace.ai/v1', model: 'marketplace-llm' },
  mars: { endpoint: 'https://api.mars.ai/v1', model: 'mars-llm' },
  meituan: { endpoint: 'https://api.meituan.com/v1', model: 'meituan-llm' },
  meta: { endpoint: 'https://api.meta.ai/v1', model: 'llama-4-maverick' },
  microsoft: { endpoint: 'https://api.microsoft.com/v1', model: 'phi-4' },
  midjourney: { endpoint: 'https://api.midjourney.com/v1', model: 'midjourney-v6' },
  minimax: { endpoint: 'https://api.minimax.chat/v1', model: 'minimax-m2.5' },
  mistral: { endpoint: 'https://api.mistral.ai/v1', model: 'mistral-large-latest' },
  modal: { endpoint: 'https://api.modal.com/v1', model: 'modal-llm' },
  modelscope: { endpoint: 'https://api.modelscope.cn/v1', model: 'modelscope-llm' },
  monadic: { endpoint: 'https://api.monadic.ai/v1', model: 'monadic-llm' },
  monster: { endpoint: 'https://api.monsterapi.ai/v1', model: 'monster-llama-3' },
  moonshot: { endpoint: 'https://api.moonshot.cn/v1', model: 'kimi-k2.5' },
  morph: { endpoint: 'https://api.morph.ai/v1', model: 'morph-llm' },
  muapi: { endpoint: 'https://api.muapi.ai/v1', model: 'muapi-llm' },
  nanogpt: { endpoint: 'https://api.nanogpt.com/v1', model: 'nanogpt-llm' },
  nebulous: { endpoint: 'https://api.nebulous.ai/v1', model: 'nebulous-llm' },
  nebius: { endpoint: 'https://api.nebius.ai/v1', model: 'nebius-llama-3' },
  neoxa: { endpoint: 'https://api.neoxa.ai/v1', model: 'neoxa-llm' },
  nitel: { endpoint: 'https://api.nitel.ai/v1', model: 'nitel-llm' },
  nlpcloud: { endpoint: 'https://api.nlpcloud.io/v1', model: 'nlpcloud-llm' },
  nomic: { endpoint: 'https://api.nomic.ai/v1', model: 'nomic-embed-text-v1' },
  novita: { endpoint: 'https://api.novita.ai/v1', model: 'deepseek-r1' },
  nscale: { endpoint: 'https://api.nscale.ai/v1', model: 'nscale-llm' },
  nvidia: { endpoint: 'https://api.nvcf.nvidia.com/v1', model: 'nvidia-nemotron' },
  oci: { endpoint: 'https://generativeai.oci.oraclecloud.com/v1', model: 'cohere.command-r-plus' },
  octoai: { endpoint: 'https://text.octoai.run/v1', model: 'octo-llm' },
  ollama: { endpoint: 'https://api.ollama.ai/v1', model: 'llama-3.2-3b' },
  openai: { endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' },
  opencode: { endpoint: 'https://api.opencode.ai/v1', model: 'opencode-llm' },
  openrouter: { endpoint: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o' },
  ovh: { endpoint: 'https://ai-endpoints.ovh.net/v1', model: 'ovh-mistral' },
  palm: { endpoint: 'https://generativelanguage.googleapis.com/v1beta', model: 'palm-2' },
  paperspace: { endpoint: 'https://api.paperspace.com/v1', model: 'paperspace-llm' },
  perplexity: { endpoint: 'https://api.perplexity.ai/v1', model: 'sonar-pro' },
  phind: { endpoint: 'https://api.phind.com/v1', model: 'phind-v2' },
  photon: { endpoint: 'https://api.photon.ai/v1', model: 'photon-llm' },
  pika: { endpoint: 'https://api.pika.art/v1', model: 'pika-2.0' },
  poem: { endpoint: 'https://api.poem.ai/v1', model: 'poem-llm' },
  poe: { endpoint: 'https://api.poe.com/v1', model: 'poe-llm' },
  polly: { endpoint: 'https://api.polly.ai/v1', model: 'polly-llm' },
  portkey: { endpoint: 'https://api.portkey.ai/v1', model: 'portkey-llm' },
  postgresml: { endpoint: 'https://api.postgresml.org/v1', model: 'postgresml-llm' },
  predictor: { endpoint: 'https://api.predictor.ai/v1', model: 'predictor-llm' },
  prem: { endpoint: 'https://api.prem.ai/v1', model: 'prem-llm' },
  privatemode: { endpoint: 'https://api.privatemode.ai/v1', model: 'privatemode-llm' },
  proxy: { endpoint: 'https://api.proxy.ai/v1', model: 'proxy-llm' },
  publicai: { endpoint: 'https://api.public.ai/v1', model: 'public-llm' },
  qdrant: { endpoint: 'https://api.qdrant.io/v1', model: 'qdrant-llm' },
  qwen: { endpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', model: 'qwen-max' },
  rapidapi: { endpoint: 'https://openai-api.p.rapidapi.com/v1', model: 'gpt-4o' },
  recraft: { endpoint: 'https://api.recraft.ai/v1', model: 'recraft-v3' },
  reka: { endpoint: 'https://api.reka.ai/v1', model: 'reka-flash' },
  replicate: { endpoint: 'https://api.replicate.com/v1', model: 'meta/meta-llama-3-70b' },
  requesty: { endpoint: 'https://api.requesty.ai/v1', model: 'requesty-llm' },
  runway: { endpoint: 'https://api.runwayml.com/v1', model: 'runway-gen-4' },
  sambanova: { endpoint: 'https://api.sambanova.ai/v1', model: 'Meta-Llama-3.3-70B-Instruct' },
  sarvam: { endpoint: 'https://api.sarvam.ai/v1', model: 'sarvam-instruct' },
  scale: { endpoint: 'https://api.scale.com/v1', model: 'scale-llm' },
  scalability: { endpoint: 'https://api.scalability.ai/v1', model: 'scalability-llm' },
  scaleway: { endpoint: 'https://api.scaleway.com/ai/v1', model: 'scaleway-llama' },
  sglang: { endpoint: 'https://api.sglang.ai/v1', model: 'sglang-llm' },
  siliconflow: { endpoint: 'https://api.siliconflow.com/v1', model: 'siliconflow-llm' },
  singularity: { endpoint: 'https://api.singularity.ai/v1', model: 'singularity-llm' },
  snowflake: { endpoint: 'https://api.snowflake.com/v1', model: 'snowflake-llm' },
  spark: { endpoint: 'https://api.spark.ai/v1', model: 'spark-llm' },
  stability: { endpoint: 'https://api.stability.ai/v1', model: 'stable-diffusion-xl' },
  stepfun: { endpoint: 'https://api.stepfun.com/v1', model: 'step-2-16k' },
  synexa: { endpoint: 'https://api.synexa.ai/v1', model: 'synexa-llm' },
  tabby: { endpoint: 'https://api.tabby.ai/v1', model: 'tabby-llm' },
  tencent: { endpoint: 'https://api.hunyuan.cloud.tencent.com/v1', model: 'hunyuan-pro' },
  tensorix: { endpoint: 'https://api.tensorix.ai/v1', model: 'tensorix-llm' },
  textcortex: { endpoint: 'https://api.textcortex.com/v1', model: 'textcortex-llm' },
  tgi: { endpoint: 'https://api.tgi.ai/v1', model: 'tgi-llm' },
  together: { endpoint: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-3.3-70B-Instruct' },
  tokenmix: { endpoint: 'https://api.tokenmix.ai/v1', model: 'tokenmix-llm' },
  triton: { endpoint: 'https://api.triton.ai/v1', model: 'triton-llm' },
  truefoundry: { endpoint: 'https://api.truefoundry.ai/v1', model: 'truefoundry-llm' },
  upstage: { endpoint: 'https://api.upstage.ai/v1', model: 'solar-pro' },
  v0: { endpoint: 'https://api.v0.dev/v1', model: 'v0-llm' },
  vast: { endpoint: 'https://api.vast.ai/v1', model: 'vast-llm' },
  vectara: { endpoint: 'https://api.vectara.io/v1', model: 'vectara-llm' },
  veniceai: { endpoint: 'https://api.venice.ai/v1', model: 'venice-llm' },
  vercel: { endpoint: 'https://api.vercel.com/v1', model: 'vercel-llm' },
  vertex: { endpoint: 'https://us-central1-aiplatform.googleapis.com/v1', model: 'gemini-2.0-pro' },
  vivgrid: { endpoint: 'https://api.vivgrid.com/v1', model: 'vivgrid-llm' },
  vllm: { endpoint: 'https://api.vllm.ai/v1', model: 'vllm-llm' },
  vultr: { endpoint: 'https://api.vultr.com/v1', model: 'vultr-llm' },
  wan: { endpoint: 'https://api.wan.ai/v1', model: 'wan-video' },
  watsonx: { endpoint: 'https://us-south.ml.cloud.ibm.com/ml/v1', model: 'ibm/granite-20b' },
  wavespeedai: { endpoint: 'https://api.wavespeed.ai/v1', model: 'wavespeed-llm' },
  weightsandbiases: { endpoint: 'https://api.wandb.ai/v1', model: 'wandb-llm' },
  windsurf: { endpoint: 'https://api.windsurf.com/v1', model: 'windsurf-cascade' },
  xai: { endpoint: 'https://api.x.ai/v1', model: 'grok-4' },
  xiaomi: { endpoint: 'https://api.xiaomi.com/v1', model: 'mimo-v2' },
  xinference: { endpoint: 'https://api.xinference.ai/v1', model: 'xinference-llm' },
  yandex: { endpoint: 'https://llm.api.cloud.yandex.net/v1', model: 'yandexgpt' },
  zai: { endpoint: 'https://api.z.ai/v1', model: 'z-llm' },
  zenmux: { endpoint: 'https://api.zenmux.com/v1', model: 'zenmux-llm' },
  zhipu: { endpoint: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-5' },
  zyphra: { endpoint: 'https://api.zyphra.com/v1', model: 'zyphra-llm' },
};

export interface ApiProviderConfig {
  provider: ApiProviderType;
  apiKey: string;
  endpoint: string;
  model: string;
}

const API_KEY_STORAGE_KEY = 'ultimate-editor-api-config';

function loadApiConfig(): ApiProviderConfig {
  try {
    const raw = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { provider: 'openai', apiKey: '', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' };
}

function saveApiConfig(config: ApiProviderConfig): void {
  try { localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(config)); } catch { /* ignore */ }
}

interface AIStore {
  inlineCompletion: string | null;
  agentMessages: ChatMessage[];
  isAgentOpen: boolean;
  agentMode: string;
  agentActions: AgentAction[];
  agentActive: boolean;
  customPrompts: SavedPrompt[];
  selectedModel: string;
  availableModels: string[];
  ollama: OllamaConfig;
  apiConfig: ApiProviderConfig;
  tokenUsage: TokenUsageEntry[];

  setInlineCompletion: (text: string | null) => void;
  setAgentMode: (m: string) => void;
  setAgentOpen: (open: boolean) => void;
  toggleAgent: () => void;
  addCustomPrompt: (name: string, content: string) => void;
  updateCustomPrompt: (id: string, updates: Partial<SavedPrompt>) => void;
  deleteCustomPrompt: (id: string) => void;
  addAgentMessage: (msg: ChatMessage) => void;
  clearAgentMessages: () => void;
  addAgentAction: (a: AgentAction) => void;
  updateAgentAction: (id: string, updates: Partial<AgentAction>) => void;
  clearAgentActions: () => void;
  setAgentActive: (a: boolean) => void;
  setModel: (m: string) => void;
  updateOllama: (config: Partial<OllamaConfig>) => void;
  testOllamaConnection: () => Promise<boolean>;
  refreshOllamaModels: () => Promise<string[]>;
  sendAgentTask: (task: string, signal?: AbortSignal) => Promise<string>;
  sendMessages: (messages: { role: string; content: string }[], signal?: AbortSignal) => Promise<string>;
  addTokenUsage: (entry: TokenUsageEntry) => void;
  clearTokenUsage: () => void;
  updateApiConfig: (config: Partial<ApiProviderConfig>) => void;
  testApiConnection: () => Promise<string>;
  callApi: (messages: { role: string; content: string }[], signal?: AbortSignal) => Promise<string>;
}

export const useAIStore = create<AIStore>()((set, get) => ({
  inlineCompletion: null,
  agentMessages: [],
  isAgentOpen: false,
  agentMode: 'build',
  agentActions: [],
  agentActive: false,
  customPrompts: loadCustomPrompts(),
  tokenUsage: loadTokenUsage(),
  selectedModel: 'claude-3-opus',
  availableModels: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'codestral-latest',
    'deepseek-coder-v2',
    'tabby-8b',
    'starcoder2-15b',
  ],
  apiConfig: loadApiConfig(),
  ollama: {
    enabled: true,
    host: 'localhost',
    port: 11434,
    model: 'deepseek-coder-v2:16b',
    availableModels: ['codellama:7b', 'codellama:13b', 'llama3:8b', 'llama3:70b', 'mistral:7b', 'mixtral:8x7b', 'deepseek-coder:6.7b', 'deepseek-coder:33b', 'deepseek-coder-v2:16b', 'phi3:3.8b', 'neural-chat:7b', 'starling-lm:7b', 'qwen2.5-coder:7b', 'codegemma:2b', 'codegemma:7b', 'starcoder2:7b', 'starcoder2:15b'],
    connectionStatus: 'disconnected',
    errorMessage: '',
  },

  setInlineCompletion: (text) => set({ inlineCompletion: text }),
  setAgentMode: (m) => set({ agentMode: m }),
  setAgentOpen: (open) => set({ isAgentOpen: open }),
  toggleAgent: () => set((s) => ({ isAgentOpen: !s.isAgentOpen })),
  addCustomPrompt: (name, content) => {
    set((s) => {
      const updated: SavedPrompt[] = [...s.customPrompts, { id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, content }];
      saveCustomPrompts(updated);
      return { customPrompts: updated };
    });
  },
  updateCustomPrompt: (id, updates) => {
    set((s) => {
      const updated = s.customPrompts.map((p) => p.id === id ? { ...p, ...updates } : p);
      saveCustomPrompts(updated);
      return { customPrompts: updated };
    });
  },
  deleteCustomPrompt: (id) => {
    set((s) => {
      const updated = s.customPrompts.filter((p) => p.id !== id);
      saveCustomPrompts(updated);
      return { customPrompts: updated };
    });
  },
  addAgentMessage: (msg) => set((s) => ({ agentMessages: [...s.agentMessages, msg] })),
  clearAgentMessages: () => set({ agentMessages: [] }),
  addAgentAction: (a) => set((s) => ({ agentActions: [...s.agentActions, a] })),
  updateAgentAction: (id, updates) =>
    set((s) => ({
      agentActions: s.agentActions.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  clearAgentActions: () => set({ agentActions: [] }),
  setAgentActive: (a) => set({ agentActive: a }),
  setModel: (m) => set({ selectedModel: m }),

  addTokenUsage: (entry) => {
    set((s) => {
      const updated = [...s.tokenUsage, entry];
      saveTokenUsage(updated);
      return { tokenUsage: updated };
    });
  },

  clearTokenUsage: () => {
    saveTokenUsage([]);
    set({ tokenUsage: [] });
  },

  updateOllama: (config) =>
    set((s) => ({ ollama: { ...s.ollama, ...config } })),

  updateApiConfig: (config) => {
    set((s) => {
      let updated = { ...s.apiConfig, ...config };
      if (config.provider && config.provider !== s.apiConfig.provider) {
        const defaults = API_PROVIDER_DEFAULTS[config.provider];
        if (defaults) {
          updated.endpoint = defaults.endpoint;
          if (!updated.model || updated.model === API_PROVIDER_DEFAULTS[s.apiConfig.provider]?.model) {
            updated.model = defaults.model;
          }
        }
      }
      saveApiConfig(updated);
      return { apiConfig: updated };
    });
  },

  testApiConnection: async () => {
    const { apiConfig } = get();
    if (!apiConfig.apiKey) return 'No API key configured';
    try {
      if (apiConfig.provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiConfig.apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: apiConfig.model || 'claude-3-haiku-20240307', max_tokens: 10, messages: [{ role: 'user', content: 'hi' }] }),
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      if (apiConfig.provider === 'google') {
        const url = `${apiConfig.endpoint.replace(/\/+$/, '')}/models/${apiConfig.model || 'gemini-2.0-flash'}:generateContent?key=${apiConfig.apiKey}`;
        const res = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] }),
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      if (apiConfig.provider === 'huggingface') {
        const base = apiConfig.endpoint.replace(/\/+$/, '');
        const model = apiConfig.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct';
        const url = base + '/' + model + '/v1/chat/completions';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], max_tokens: 10 }),
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      if (apiConfig.provider === 'replicate') {
        const res = await fetch('https://api.replicate.com/v1/models', {
          headers: { Authorization: `Token ${apiConfig.apiKey}` },
          signal: AbortSignal.timeout(10000),
        });
        return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
      }
      const endpoint = apiConfig.endpoint.replace(/\/+$/, '') + '/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
        body: JSON.stringify({ model: apiConfig.model || 'gpt-4o', messages: [{ role: 'user', content: 'hi' }], max_tokens: 10 }),
        signal: AbortSignal.timeout(10000),
      });
      return res.ok ? 'Connected' : `Error ${res.status}: ${res.statusText}`;
    } catch (err: any) {
      return err.message || 'Connection failed';
    }
  },

  testOllamaConnection: async () => {
    const { ollama } = get();
    set((s) => ({ ollama: { ...s.ollama, connectionStatus: 'connecting', errorMessage: '' } }));
    try {
      const url = `http://${ollama.host}:${ollama.port}/api/tags`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        set((s) => ({ ollama: { ...s.ollama, connectionStatus: 'connected' } }));
        return true;
      }
      throw new Error(`Status ${response.status}`);
    } catch (err: any) {
      set((s) => ({
        ollama: {
          ...s.ollama,
          connectionStatus: 'error',
          errorMessage: err.message || 'Connection failed',
        },
      }));
      return false;
    }
  },

  refreshOllamaModels: async () => {
    const { ollama } = get();
    try {
      const url = `http://${ollama.host}:${ollama.port}/api/tags`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        const models = (data.models || []).map((m: any) => m.name);
        if (models.length > 0) {
          set((s) => ({ ollama: { ...s.ollama, availableModels: models } }));
        }
        return models;
      }
      return [];
    } catch {
      return [];
    }
  },

  callApi: async (messages: { role: string; content: string }[], signal?: AbortSignal): Promise<string> => {
    const { apiConfig, addTokenUsage } = get();
    let data: any;
    let modelName = apiConfig.model;

    if (apiConfig.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiConfig.apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: modelName, max_tokens: 4096, messages }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Anthropic API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      if (data.usage) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: modelName, promptTokens: data.usage.input_tokens || 0,
          responseTokens: data.usage.output_tokens || 0,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
          timestamp: Date.now(),
        });
      }
      return data.content?.[0]?.text || '';
    }

    if (apiConfig.provider === 'google') {
      const url = `${apiConfig.endpoint.replace(/\/+$/, '')}/models/${modelName}:generateContent?key=${apiConfig.apiKey}`;
      const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Google API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      if (data.usageMetadata) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: modelName, promptTokens: data.usageMetadata.promptTokenCount || 0,
          responseTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
          timestamp: Date.now(),
        });
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (apiConfig.provider === 'huggingface') {
      const endpoint = `${apiConfig.endpoint.replace(/\/+$/, '')}/${modelName}/v1/chat/completions`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
        body: JSON.stringify({ model: modelName, messages, max_tokens: 4096 }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`HuggingFace API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      if (data.usage) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: modelName, promptTokens: data.usage.prompt_tokens || 0,
          responseTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
          timestamp: Date.now(),
        });
      }
      return data.choices?.[0]?.message?.content || '';
    }

    if (apiConfig.provider === 'replicate') {
      const res = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${apiConfig.apiKey}` },
        body: JSON.stringify({ model: modelName, input: { prompt: messages[messages.length - 1]?.content || 'hi' } }),
        signal,
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Replicate API error ${res.status}: ${res.statusText}. ${errBody}`);
      }
      data = await res.json();
      return data.output || '';
    }

    const endpoint = apiConfig.endpoint.replace(/\/+$/, '') + '/chat/completions';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiConfig.apiKey}` },
      body: JSON.stringify({ model: modelName, messages, max_tokens: 4096 }),
      signal,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${res.statusText}. ${errBody}`);
    }
    data = await res.json();
    if (data.usage) {
      addTokenUsage({
        id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        model: modelName, promptTokens: data.usage.prompt_tokens || 0,
        responseTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
        timestamp: Date.now(),
      });
    }
    return data.choices?.[0]?.message?.content || '';
  },

  sendMessages: async (messages, signal) => {
    const { ollama, apiConfig, addTokenUsage } = get();
    if (ollama.enabled) {
      const url = `http://${ollama.host}:${ollama.port}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollama.model, messages, stream: false }),
        signal,
      });
      if (!response.ok) throw new Error(ollamaErrorMsg(response.status, ollama.model));
      const data = await response.json();
      const promptTokens = data.prompt_eval_count || 0;
      const responseTokens = data.eval_count || 0;
      if (promptTokens > 0 || responseTokens > 0) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: ollama.model, promptTokens, responseTokens,
          totalTokens: promptTokens + responseTokens, timestamp: Date.now(),
        });
      }
      return data.message?.content || '';
    }
    if (apiConfig.apiKey) {
      return get().callApi(messages, signal);
    }
    throw new Error('No AI backend configured. Enable Ollama or configure an API provider in Settings.');
  },

  sendAgentTask: async (task, signal) => {
    const { ollama, apiConfig, addTokenUsage, agentMode, customPrompts } = get();
    const builtin = AGENT_SYSTEM_PROMPTS[agentMode];
    const custom = customPrompts.find((p) => p.id === agentMode);
    const systemMsg = (custom ? custom.content : (builtin || AGENT_SYSTEM_PROMPTS.plan)) + '\n\n' + TOOL_INSTRUCTIONS;

    if (ollama.enabled) {
      const url = `http://${ollama.host}:${ollama.port}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollama.model,
          messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: task }],
          stream: false,
        }),
        signal,
      });
      if (!response.ok) throw new Error(ollamaErrorMsg(response.status, ollama.model));
      const data = await response.json();
      const promptTokens = data.prompt_eval_count || 0;
      const responseTokens = data.eval_count || 0;
      if (promptTokens > 0 || responseTokens > 0) {
        addTokenUsage({
          id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          model: ollama.model,
          promptTokens,
          responseTokens,
          totalTokens: promptTokens + responseTokens,
          timestamp: Date.now(),
        });
      }
      return data.message?.content || '';
    }

    if (apiConfig.apiKey) {
      return get().callApi([{ role: 'system', content: systemMsg }, { role: 'user', content: task }], signal);
    }

    throw new Error('No AI backend configured. Enable Ollama or configure an API provider in Settings.');
  },
}));

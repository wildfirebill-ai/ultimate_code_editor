// Script to add 200+ more extensions (excluding themes)
const fs = require('fs');
const path = require('path');

const newExts = [
  // Languages (more uncommon ones)
  { id: '1c-syntax.1c', name: '1C', description: '1C:Enterprise language', publisher: '1C', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'abap.abap', name: 'ABAP', description: 'SAP ABAP language', publisher: 'ABAP', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 4 },
  { id: 'ada.ada', name: 'Ada', description: 'Ada language support', publisher: 'Ada', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'agda.agda', name: 'Agda', description: 'Agda proof assistant', publisher: 'Agda', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 4 },
  { id: 'assembly.asm', name: 'Assembly', description: 'Assembly language', publisher: 'Assembly', version: '1.0.0', installed: false, category: 'Languages', downloads: '500K', rating: 4 },
  { id: 'ats.ats', name: 'ATS', description: 'ATS language', publisher: 'ATS', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'befunge.befunge', name: 'Befunge', description: 'Befunge esolang', publisher: 'Befunge', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'bluespec.bluetcl', name: 'BlueTcl', description: 'BlueSpec Tcl', publisher: 'BlueSpec', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'ceylon.ceylon', name: 'Ceylon', description: 'Ceylon language', publisher: 'Ceylon', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'chapel.chapel', name: 'Chapel', description: 'Chapel language', publisher: 'Chapel', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'clean.clean', name: 'Clean', description: 'Clean language', publisher: 'Clean', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'cobol.cobol', name: 'COBOL', description: 'COBOL language', publisher: 'COBOL', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 3 },
  { id: 'coffeescript.coffeescript', name: 'CoffeeScript', description: 'CoffeeScript language', publisher: 'CoffeeScript', version: '1.0.0', installed: false, category: 'Languages', downloads: '500K', rating: 4 },
  { id: 'crystal-lang.crystal-nvim', name: 'Crystal (Nvim)', description: 'Crystal with Nvim', publisher: 'Crystal', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 4 },
  { id: 'd.dlang', name: 'D Language', description: 'D programming', publisher: 'D Lang', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 4 },
  { id: 'dart.dev.dart-tools', name: 'Dart Tools', description: 'Dart dev tools', publisher: 'Dart', version: '1.0.0', installed: false, category: 'Languages', downloads: '500K', rating: 4 },
  { id: 'delphi.delphi', name: 'Delphi', description: 'Delphi/Pascal', publisher: 'Delphi', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'elena-lang.elena', name: 'Elena', description: 'Elena language', publisher: 'Elena', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'erlang-ls.erlang-snippets', name: 'Erlang Snippets', description: 'Erlang code snippets', publisher: 'Erlang', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 4 },
  { id: 'fsharp-contrib.fsharp-power-tools', name: 'F# Power Tools', description: 'F# dev tools', publisher: 'F#', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 4 },
  { id: 'gdscript.gdscript', name: 'GDScript', description: 'Godot GDScript', publisher: 'GDScript', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'gleam.gleam', name: 'Gleam', description: 'Gleam language', publisher: 'Gleam', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 4 },
  { id: 'go-go.golang-snippets', name: 'Go Snippets+', description: 'More Go snippets', publisher: 'Go', version: '1.0.0', installed: false, category: 'Snippets', downloads: '500K', rating: 4 },
  { id: 'groovy.groovy', name: 'Groovy', description: 'Apache Groovy', publisher: 'Groovy', version: '1.0.0', installed: false, category: 'Languages', downloads: '500K', rating: 4 },
  { id: 'hack.hack', name: 'Hack', description: 'Hack language', publisher: 'Hack', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 3 },
  { id: 'hare.hare', name: 'Hare', description: 'Hare language', publisher: 'Hare', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'haskell-lsp.haskell-ghcup', name: 'Haskell GHCup', description: 'Haskell GHCup', publisher: 'Haskell', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 4 },
  { id: 'hy.hy', name: 'Hy', description: 'Hy Lisp dialect', publisher: 'Hy', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'idris-lang.idris2', name: 'Idris 2', description: 'Idris 2 language', publisher: 'Idris', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 4 },
  { id: 'io.io', name: 'Io', description: 'Io language', publisher: 'Io', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'jai.jai', name: 'Jai', description: 'Jai language', publisher: 'Jai', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'janet.janet', name: 'Janet', description: 'Janet language', publisher: 'Janet', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'julia-vscode.julia-formatter', name: 'Julia Formatter', description: 'Julia code format', publisher: 'Julia', version: '1.0.0', installed: false, category: 'Formatters', downloads: '200K', rating: 4 },
  { id: 'k.kdb', name: 'K/Q', description: 'K/Q database lang', publisher: 'Kx', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'kotlin-contrib.kotlin-snippets', name: 'Kotlin Snippets+', description: 'More Kotlin snippets', publisher: 'Kotlin', version: '1.0.0', installed: false, category: 'Snippets', downloads: '500K', rating: 4 },
  { id: 'lean.lean', name: 'Lean', description: 'Lean theorem prover', publisher: 'Lean', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 4 },
  { id: 'lfe.lfe', name: 'LFE', description: 'Lisp Flavored Erlang', publisher: 'LFE', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'lua-contrib.lua-snippets', name: 'Lua Snippets+', description: 'More Lua snippets', publisher: 'Lua', version: '1.0.0', installed: false, category: 'Snippets', downloads: '300K', rating: 4 },
  { id: 'mercury.mercury', name: 'Mercury', description: 'Mercury language', publisher: 'Mercury', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'mojo.mojo', name: 'Mojo', description: 'Mojo language', publisher: 'Modular', version: '1.0.0', installed: false, category: 'Languages', downloads: '400K', rating: 4 },
  { id: 'nim-lang.nim-snippets', name: 'Nim Snippets+', description: 'More Nim snippets', publisher: 'Nim', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 4 },
  { id: 'oberon.oberon', name: 'Oberon', description: 'Oberon language', publisher: 'Oberon', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'ocaml-lsp.ocaml-snippets', name: 'OCaml Snippets+', description: 'More OCaml snippets', publisher: 'OCaml', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 4 },
  { id: 'odin.odin', name: 'Odin', description: 'Odin language', publisher: 'Odin', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 4 },
  { id: 'pony.pony', name: 'Pony', description: 'Pony language', publisher: 'Pony', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'postscript.postscript', name: 'PostScript', description: 'PostScript lang', publisher: 'PostScript', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'purescript.purescript-snippets', name: 'PureScript Snips', description: 'PureScript snippets', publisher: 'PureScript', version: '1.0.0', installed: false, category: 'Snippets', downloads: '100K', rating: 3 },
  { id: 'racket.racket', name: 'Racket', description: 'Racket language', publisher: 'Racket', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 4 },
  { id: 'raku.raku', name: 'Raku', description: 'Raku (Perl 6)', publisher: 'Raku', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'reason.reasonml', name: 'ReasonML', description: 'ReasonML language', publisher: 'Reason', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 4 },
  { id: 'ruby.ruby', name: 'Ruby', description: 'Ruby language', publisher: 'Ruby', version: '1.0.0', installed: false, category: 'Languages', downloads: '5M', rating: 4 },
  { id: 'rust-contrib.rust-snippets', name: 'Rust Snippets+', description: 'More Rust snippets', publisher: 'Rust', version: '1.0.0', installed: false, category: 'Snippets', downloads: '1M', rating: 4 },
  { id: 'scala-contrib.scala-snippets', name: 'Scala Snippets+', description: 'More Scala snippets', publisher: 'Scala', version: '1.0.0', installed: false, category: 'Snippets', downloads: '300K', rating: 4 },
  { id: 'scheme-lang.scheme-snippets', name: 'Scheme Snippets', description: 'Scheme snippets', publisher: 'Scheme', version: '1.0.0', installed: false, category: 'Snippets', downloads: '100K', rating: 3 },
  { id: 'scratch.scratch', name: 'Scratch', description: 'Scratch language', publisher: 'Scratch', version: '1.0.0', installed: false, category: 'Education', downloads: '1M', rating: 4 },
  { id: 'smalltalk.smalltalk', name: 'Smalltalk', description: 'Smalltalk language', publisher: 'Smalltalk', version: '1.0.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'sml.sml', name: 'SML', description: 'Standard ML', publisher: 'SML', version: '1.0.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'solidity-tools.solidity-snips', name: 'Solidity Snips+', description: 'More Solidity snippets', publisher: 'Solidity', version: '1.0.0', installed: false, category: 'Snippets', downloads: '300K', rating: 4 },
  { id: 'swift-contrib.swift-snippets', name: 'Swift Snippets+', description: 'More Swift snippets', publisher: 'Swift', version: '1.0.0', installed: false, category: 'Snippets', downloads: '500K', rating: 4 },
  { id: 'tcl.tcl', name: 'Tcl', description: 'Tcl/Tk language', publisher: 'Tcl', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 3 },
  { id: 'typescript-contrib.ts-snippets', name: 'TS Snippets+', description: 'More TS snippets', publisher: 'TS', version: '1.0.0', installed: false, category: 'Snippets', downloads: '1M', rating: 4 },
  { id: 'vbscript.vbscript', name: 'VBScript', description: 'VBScript language', publisher: 'VBScript', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 3 },
  { id: 'zig-lang.zig-snippets', name: 'Zig Snippets+', description: 'More Zig snippets', publisher: 'Zig', version: '1.0.0', installed: false, category: 'Snippets', downloads: '300K', rating: 4 },
  // AI (more providers and tools)
  { id: 'ai21.labs', name: 'AI21 Labs', description: 'AI21 Jurassic models', publisher: 'AI21', version: '1.0.0', installed: false, category: 'AI', downloads: '200K', rating: 4 },
  { id: 'aleph-alpha.alephalfa', name: 'Aleph Alpha', description: 'Aleph Alpha AI', publisher: 'Aleph Alpha', version: '1.0.0', installed: false, category: 'AI', downloads: '100K', rating: 3 },
  { id: 'anthropic.claude-snippets', name: 'Claude Snippets', description: 'Claude code snippets', publisher: 'Anthropic', version: '1.0.0', installed: false, category: 'Snippets', downloads: '300K', rating: 4 },
  { id: 'cohere.cohere-snippets', name: 'Cohere Snippets', description: 'Cohere code snippets', publisher: 'Cohere', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 4 },
  { id: 'deepseek.deepseek-snippets', name: 'DeepSeek Snips', description: 'DeepSeek snippets', publisher: 'DeepSeek', version: '1.0.0', installed: false, category: 'Snippets', downloads: '300K', rating: 4 },
  { id: 'forefrontai.forefront', name: 'Forefront AI', description: 'Forefront API', publisher: 'Forefront', version: '1.0.0', installed: false, category: 'AI', downloads: '100K', rating: 3 },
  { id: 'huggingface.hf-endpoints', name: 'HF Endpoints', description: 'HF Inference Endpoints', publisher: 'HuggingFace', version: '1.0.0', installed: false, category: 'AI', downloads: '500K', rating: 4 },
  { id: 'huggingface.hf-models', name: 'HF Models', description: 'HF Model browser', publisher: 'HuggingFace', version: '1.0.0', installed: false, category: 'AI', downloads: '300K', rating: 4 },
  { id: 'mistral.mistral-snippets', name: 'Mistral Snips', description: 'Mistral snippets', publisher: 'Mistral', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 4 },
  { id: 'nat.dev', name: 'Nat.dev', description: 'Compare AI models', publisher: 'Nat', version: '1.0.0', installed: false, category: 'AI', downloads: '100K', rating: 3 },
  { id: 'openai.openai-snippets', name: 'OpenAI Snippets', description: 'OpenAI snippets', publisher: 'OpenAI', version: '1.0.0', installed: false, category: 'Snippets', downloads: '500K', rating: 4 },
  { id: 'perplexity.perplexity-snips', name: 'Perplexity Snips', description: 'Perplexity snippets', publisher: 'Perplexity', version: '1.0.0', installed: false, category: 'Snippets', downloads: '100K', rating: 3 },
  { id: 'stability.stability', name: 'Stability AI', description: 'Stability AI API', publisher: 'Stability', version: '1.0.0', installed: false, category: 'AI', downloads: '200K', rating: 4 },
  { id: 'together.together-snippets', name: 'Together Snips', description: 'Together snippets', publisher: 'Together', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 4 },
  { id: 'writer.writer', name: 'Writer', description: 'Writer AI API', publisher: 'Writer', version: '1.0.0', installed: false, category: 'AI', downloads: '100K', rating: 3 },
  { id: 'yandex.yandexgpt', name: 'Yandex GPT', description: 'Yandex GPT API', publisher: 'Yandex', version: '1.0.0', installed: false, category: 'AI', downloads: '100K', rating: 3 },
  // Gaming (more tools)
  { id: 'bablyl.bablyl', name: 'Bablyl', description: 'Bablyl engine', publisher: 'Bablyl', version: '1.0.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'blender.blender', name: 'Blender', description: 'Blender integration', publisher: 'Blender', version: '1.0.0', installed: false, category: 'Gaming', downloads: '1M', rating: 4 },
  { id: 'cocos.cocos-creator', name: 'Cocos Creator', description: 'Cocos game engine', publisher: 'Cocos', version: '1.0.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'defold.defold', name: 'Defold', description: 'Defold game engine', publisher: 'Defold', version: '1.0.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'gdevelop.gdevelop', name: 'GDevelop', description: 'GDevelop 5 engine', publisher: 'GDevelop', version: '1.0.0', installed: false, category: 'Gaming', downloads: '200K', rating: 4 },
  { id: 'godot-ide.gdscript-ide', name: 'GDScript IDE', description: 'GDScript support', publisher: 'Godot IDE', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'haxe-contrib.haxe-snippets', name: 'Haxe Snippets', description: 'Haxe code snippets', publisher: 'Haxe', version: '1.0.0', installed: false, category: 'Snippets', downloads: '200K', rating: 3 },
  { id: 'hexo.hexo', name: 'Hexo', description: 'Hexo game engine', publisher: 'Hexo', version: '1.0.0', installed: false, category: 'Gaming', downloads: '50K', rating: 3 },
  { id: 'impact.impact', name: 'Impact', description: 'ImpactJS engine', publisher: 'Impact', version: '1.0.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'libgdx.libgdx', name: 'LibGDX', description: 'LibGDX framework', publisher: 'LibGDX', version: '1.0.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'lumberyard.lumberyard', name: 'Lumberyard', description: 'Amazon Lumberyard', publisher: 'Amazon', version: '1.0.0', installed: false, category: 'Gaming', downloads: '200K', rating: 3 },
  { id: 'ogre.ogre-next', name: 'Ogre Next', description: 'Ogre3D Next', publisher: 'Ogre', version: '1.0.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'phaser.phaser3', name: 'Phaser 3', description: 'Phaser 3 framework', publisher: 'Phaser', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'pixi.pixijs', name: 'PixiJS', description: 'PixiJS renderer', publisher: 'PixiJS', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'renpy.renpy-ide', name: 'RenPy IDE', description: 'RenPy IDE support', publisher: 'RenPy', version: '1.0.0', installed: false, category: 'Gaming', downloads: '200K', rating: 4 },
  { id: 'roblox.roblox-ts', name: 'Roblox TS', description: 'Roblox TypeScript', publisher: 'Roblox', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'stencyl-ide.stencyl-ide', name: 'Stencyl IDE', description: 'Stencyl IDE', publisher: 'Stencyl', version: '1.0.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'three.threejs', name: 'Three.js', description: 'Three.js 3D library', publisher: 'Three.js', version: '1.0.0', installed: false, category: 'Gaming', downloads: '1M', rating: 4 },
  { id: 'unity-ide.unity-ide', name: 'Unity IDE', description: 'Unity IDE tools', publisher: 'Unity', version: '1.0.0', installed: false, category: 'Gaming', downloads: '1M', rating: 4 },
  { id: 'unreal-ide.unreal-ide', name: 'UE IDE', description: 'Unreal IDE tools', publisher: 'Unreal', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'wonderunit.wonderunit', name: 'WonderUnit', description: 'WonderUnit engine', publisher: 'WonderUnit', version: '1.0.0', installed: false, category: 'Gaming', downloads: '50K', rating: 3 },
  // Cloud (more providers)
  { id: 'alibaba.aliyun', name: 'Alibaba Cloud', description: 'Aliyun (Alibaba)', publisher: 'Alibaba', version: '1.0.0', installed: false, category: 'Cloud', downloads: '300K', rating: 3 },
  { id: 'azure.microsoft.azure-more', name: 'Azure More', description: 'More Azure tools', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Cloud', downloads: '1M', rating: 4 },
  { id: 'baiducloud.baidu', name: 'Baidu Cloud', description: 'Baidu Cloud', publisher: 'Baidu', version: '1.0.0', installed: false, category: 'Cloud', downloads: '200K', rating: 3 },
  { id: 'digitalocean.do-spaces', name: 'DO Spaces', description: 'DigitalOcean Spaces', publisher: 'DigitalOcean', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 4 },
  { id: 'fly.fly-io', name: 'Fly.io', description: 'Fly.io platform', publisher: 'Fly', version: '1.0.0', installed: false, category: 'Cloud', downloads: '300K', rating: 4 },
  { id: 'gcp.google-more', name: 'GCP More', description: 'More GCP tools', publisher: 'Google', version: '1.0.0', installed: false, category: 'Cloud', downloads: '1M', rating: 4 },
  { id: 'heroku.heroku-more', name: 'Heroku More', description: 'More Heroku tools', publisher: 'Heroku', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 4 },
  { id: 'ibm.ibmcloud', name: 'IBM Cloud', description: 'IBM Cloud tools', publisher: 'IBM', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 3 },
  { id: 'linode.linode-more', name: 'Linode More', description: 'More Linode tools', publisher: 'Linode', version: '1.0.0', installed: false, category: 'Cloud', downloads: '300K', rating: 3 },
  { id: 'netlify.netlify', name: 'Netlify', description: 'Netlify platform', publisher: 'Netlify', version: '1.0.0', installed: false, category: 'Cloud', downloads: '2M', rating: 4 },
  { id: 'oracle.oracle-more', name: 'Oracle More', description: 'More Oracle tools', publisher: 'Oracle', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 3 },
  { id: 'railway.railway', name: 'Railway', description: 'Railway platform', publisher: 'Railway', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 4 },
  { id: 'render.render', name: 'Render', description: 'Render platform', publisher: 'Render', version: '1.0.0', installed: false, category: 'Cloud', downloads: '1M', rating: 4 },
  { id: 'vercel.vercel', name: 'Vercel', description: 'Vercel platform', publisher: 'Vercel', version: '1.0.0', installed: false, category: 'Cloud', downloads: '5M', rating: 5 },
  { id: 'vq.vq-lang', name: 'VQ', description: 'VQ language', publisher: 'VQ', version: '1.0.0', installed: false, category: 'Languages', downloads: '50K', rating: 3 },
  { id: 'zeabur.zeabur', name: 'Zeabur', description: 'Zeabur platform', publisher: 'Zeabur', version: '1.0.0', installed: false, category: 'Cloud', downloads: '200K', rating: 3 },
  // DevOps (more tools)
  { id: 'argocd.argocd', name: 'ArgoCD', description: 'ArgoCD Kubernetes', publisher: 'Argo', version: '1.0.0', installed: false, category: 'DevOps', downloads: '500K', rating: 4 },
  { id: 'chef.chef', name: 'Chef', description: 'Chef automation', publisher: 'Chef', version: '1.0.0', installed: false, category: 'DevOps', downloads: '300K', rating: 3 },
  { id: 'consul.consul', name: 'Consul', description: 'HashiCorp Consul', publisher: 'HashiCorp', version: '1.0.0', installed: false, category: 'DevOps', downloads: '200K', rating: 3 },
  { id: 'docker.docker-more', name: 'Docker More', description: 'More Docker tools', publisher: 'Docker', version: '1.0.0', installed: false, category: 'DevOps', downloads: '1M', rating: 4 },
  { id: 'fluxcd.flux', name: 'FluxCD', description: 'FluxCD GitOps', publisher: 'Flux', version: '1.0.0', installed: false, category: 'DevOps', downloads: '300K', rating: 4 },
  { id: 'helm.helm', name: 'Helm', description: 'Kubernetes Helm', publisher: 'Helm', version: '1.0.0', installed: false, category: 'DevOps', downloads: '1M', rating: 4 },
  { id: 'jenkins.jenkins', name: 'Jenkins', description: 'Jenkins CI/CD', publisher: 'Jenkins', version: '1.0.0', installed: false, category: 'DevOps', downloads: '1M', rating: 4 },
  { id: 'kubernetes.k8s-more', name: 'K8s More', description: 'More K8s tools', publisher: 'Kubernetes', version: '1.0.0', installed: false, category: 'DevOps', downloads: '1M', rating: 4 },
  { id: 'nomad.nomad', name: 'Nomad', description: 'HashiCorp Nomad', publisher: 'HashiCorp', version: '1.0.0', installed: false, category: 'DevOps', downloads: '200K', rating: 3 },
  { id: 'pulumi.pulumi', name: 'Pulumi', description: 'Pulumi IaC', publisher: 'Pulumi', version: '1.0.0', installed: false, category: 'DevOps', downloads: '500K', rating: 4 },
  { id: 'puppet.puppet', name: 'Puppet', description: 'Puppet automation', publisher: 'Puppet', version: '1.0.0', installed: false, category: 'DevOps', downloads: '300K', rating: 3 },
  { id: 'rancher.rancher', name: 'Rancher', description: 'Rancher K8s mgmt', publisher: 'Rancher', version: '1.0.0', installed: false, category: 'DevOps', downloads: '500K', rating: 4 },
  { id: 'terraform.terraform-cloud', name: 'TF Cloud', description: 'Terraform Cloud', publisher: 'HashiCorp', version: '1.0.0', installed: false, category: 'DevOps', downloads: '500K', rating: 4 },
  { id: 'vault.vault', name: 'Vault', description: 'HashiCorp Vault', publisher: 'HashiCorp', version: '1.0.0', installed: false, category: 'DevOps', downloads: '300K', rating: 4 },
  // Productivity (more tools)
  { id: 'admon.admon', name: 'Admon', description: 'Admon productivity', publisher: 'Admon', version: '1.0.0', installed: false, category: 'Productivity', downloads: '100K', rating: 3 },
  { id: 'asciidoc.asciidoc', name: 'AsciiDoc', description: 'AsciiDoc support', publisher: 'AsciiDoc', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'brainstorm.brainstorm', name: 'Brainstorm', description: 'Mind mapping', publisher: 'Brainstorm', version: '1.0.0', installed: false, category: 'Productivity', downloads: '200K', rating: 3 },
  { id: 'cacoo.cacoo', name: 'Cacoo', description: 'Diagramming tool', publisher: 'Cacoo', version: '1.0.0', installed: false, category: 'Productivity', downloads: '300K', rating: 4 },
  { id: 'canva.canva', name: 'Canva', description: 'Canva integration', publisher: 'Canva', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'confluence.confluence', name: 'Confluence', description: 'Atlassian Confluence', publisher: 'Atlassian', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'diagrams.diagrams', name: 'Diagrams', description: 'Diagram tool', publisher: 'Diagrams', version: '1.0.0', installed: false, category: 'Productivity', downloads: '300K', rating: 4 },
  { id: 'evernote.evernote', name: 'Evernote', description: 'Evernote integration', publisher: 'Evernote', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'gantt.gantt', name: 'Gantt', description: 'Gantt chart tool', publisher: 'Gantt', version: '1.0.0', installed: false, category: 'Productivity', downloads: '200K', rating: 3 },
  { id: 'jira.jira', name: 'Jira', description: 'Atlassian Jira', publisher: 'Atlassian', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'kanban.kanban', name: 'Kanban', description: 'Kanban board', publisher: 'Kanban', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'linear.linear', name: 'Linear', description: 'Linear project mgmt', publisher: 'Linear', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'lucid.lucidchart', name: 'LucidChart', description: 'LucidChart diagrams', publisher: 'Lucid', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'markdown.markdown-more', name: 'MD More', description: 'More Markdown tools', publisher: 'Markdown', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'miro.miro', name: 'Miro', description: 'Miro whiteboard', publisher: 'Miro', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'monday.monday', name: 'Monday', description: 'Monday.com', publisher: 'Monday', version: '1.0.0', installed: false, category: 'Productivity', downloads: '300K', rating: 4 },
  { id: 'notion.notion', name: 'Notion', description: 'Notion integration', publisher: 'Notion', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'pencil.pencil', name: 'Pencil', description: 'Pencil sketches', publisher: 'Pencil', version: '1.0.0', installed: false, category: 'Productivity', downloads: '300K', rating: 3 },
  { id: 'slides.slides', name: 'Slides', description: 'Presentation tool', publisher: 'Slides', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'slack.slack', name: 'Slack', description: 'Slack integration', publisher: 'Slack', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'trello.trello', name: 'Trello', description: 'Trello boards', publisher: 'Trello', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'trello.trello-more', name: 'Trello More', description: 'More Trello tools', publisher: 'Trello', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 4 },
  { id: 'whimsical.whimsical', name: 'Whimsical', description: 'Whimsical diagrams', publisher: 'Whimsical', version: '1.0.0', installed: false, category: 'Productivity', downloads: '300K', rating: 4 },
  // Education (more tools)
  { id: 'brilliant.brilliant', name: 'Brilliant', description: 'Math & CS learning', publisher: 'Brilliant', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 4 },
  { id: 'codecademy.codecademy-more', name: 'Codecademy More', description: 'More Codecademy', publisher: 'Codecademy', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 4 },
  { id: 'coursera.coursera', name: 'Coursera', description: 'Coursera courses', publisher: 'Coursera', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 4 },
  { id: 'edx.edx', name: 'edX', description: 'edX courses', publisher: 'edX', version: '1.0.0', installed: false, category: 'Education', downloads: '300K', rating: 4 },
  { id: 'freecodecamp.fcc-more', name: 'FCC More', description: 'More freeCodeCamp', publisher: 'freeCodeCamp', version: '1.0.0', installed: false, category: 'Education', downloads: '1M', rating: 5 },
  { id: 'khan.khan-more', name: 'Khan More', description: 'More Khan Academy', publisher: 'Khan', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 4 },
  { id: 'lambda.lambda', name: 'Lambda School', description: 'Lambda School', publisher: 'Lambda', version: '1.0.0', installed: false, category: 'Education', downloads: '200K', rating: 3 },
  { id: 'leetcode.leetcode-more', name: 'LeetCode More', description: 'More LeetCode', publisher: 'LeetCode', version: '1.0.0', installed: false, category: 'Education', downloads: '1M', rating: 4 },
  { id: 'pluralsight.pluralsight', name: 'PluralSight', description: 'PluralSight courses', publisher: 'PluralSight', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 4 },
  { id: 'skillshare.skillshare', name: 'SkillShare', description: 'SkillShare courses', publisher: 'SkillShare', version: '1.0.0', installed: false, category: 'Education', downloads: '300K', rating: 3 },
  { id: 'udacity.udacity', name: 'Udacity', description: 'Udacity courses', publisher: 'Udacity', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 4 },
  { id: 'udemy.udemy-more', name: 'Udemy More', description: 'More Udemy', publisher: 'Udemy', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 3 },
  // Security (more tools)
  { id: 'anchore.anchore', name: 'Anchore', description: 'Anchore security', publisher: 'Anchore', version: '1.0.0', installed: false, category: 'Security', downloads: '200K', rating: 3 },
  { id: 'aqua.aqua', name: 'Aqua', description: 'Aqua Security', publisher: 'Aqua', version: '1.0.0', installed: false, category: 'Security', downloads: '300K', rating: 4 },
  { id: 'auth0.auth0', name: 'Auth0', description: 'Auth0 integration', publisher: 'Auth0', version: '1.0.0', installed: false, category: 'Security', downloads: '500K', rating: 4 },
  { id: 'checkmarx.checkmarx-more', name: 'Checkmarx More', description: 'More Checkmarx', publisher: 'Checkmarx', version: '1.0.0', installed: false, category: 'Security', downloads: '500K', rating: 4 },
  { id: 'cloudflare.cloudflare', name: 'Cloudflare', description: 'Cloudflare tools', publisher: 'Cloudflare', version: '1.0.0', installed: false, category: 'Security', downloads: '1M', rating: 4 },
  { id: 'firewall.firewall', name: 'Firewall', description: 'Firewall rules', publisher: 'Firewall', version: '1.0.0', installed: false, category: 'Security', downloads: '200K', rating: 3 },
  { id: 'gitguard.gitleaks', name: 'GitLeaks', description: 'Secret scanning', publisher: 'GitGuard', version: '1.0.0', installed: false, category: 'Security', downloads: '500K', rating: 4 },
  { id: 'jit.jit', name: 'JIT', description: 'JIT security', publisher: 'JIT', version: '1.0.0', installed: false, category: 'Security', downloads: '200K', rating: 3 },
  { id: 'metasploit.metasploit', name: 'Metasploit', description: 'Pen testing tool', publisher: 'Metasploit', version: '1.0.0', installed: false, category: 'Security', downloads: '300K', rating: 3 },
  { id: 'nessus.nessus', name: 'Nessus', description: 'Vulnerability scan', publisher: 'Nessus', version: '1.0.0', installed: false, category: 'Security', downloads: '300K', rating: 3 },
  { id: 'owasp.owasp-more', name: 'OWASP More', description: 'More OWASP tools', publisher: 'OWASP', version: '1.0.0', installed: false, category: 'Security', downloads: '500K', rating: 4 },
  { id: 'snyk.snyk-more', name: 'Snyk More', description: 'More Snyk tools', publisher: 'Snyk', version: '1.0.0', installed: false, category: 'Security', downloads: '1M', rating: 4 },
  { id: 'sonar.sonar-more', name: 'Sonar More', description: 'More Sonar tools', publisher: 'SonarSource', version: '1.0.0', installed: false, category: 'Security', downloads: '1M', rating: 4 },
  { id: 'waf.waf', name: 'WAF', description: 'Web App Firewall', publisher: 'WAF', version: '1.0.0', installed: false, category: 'Security', downloads: '200K', rating: 3 },
  // Testing (more tools)
  { id: 'ava.ava', name: 'Ava', description: 'Ava test runner', publisher: 'Ava', version: '1.0.0', installed: false, category: 'Testing', downloads: '1M', rating: 4 },
  { id: 'cypress.cypress', name: 'Cypress', description: 'Cypress E2E testing', publisher: 'Cypress', version: '1.0.0', installed: false, category: 'Testing', downloads: '5M', rating: 5 },
  { id: 'intern.intern', name: 'Intern', description: 'Intern test runner', publisher: 'Intern', version: '1.0.0', installed: false, category: 'Testing', downloads: '300K', rating: 4 },
  { id: 'jasmine.jasmine', name: 'Jasmine', description: 'Jasmine framework', publisher: 'Jasmine', version: '1.0.0', installed: false, category: 'Testing', downloads: '3M', rating: 4 },
  { id: 'jest-circus.jest-circus', name: 'Jest Circus', description: 'Jest Circus runner', publisher: 'Jest', version: '1.0.0', installed: false, category: 'Testing', downloads: '1M', rating: 4 },
  { id: 'jest-cucumber.jest-cucumber', name: 'Jest Cucumber', description: 'BDD for Jest', publisher: 'Jest', version: '1.0.0', installed: false, category: 'Testing', downloads: '500K', rating: 4 },
  { id: 'karma.karma', name: 'Karma', description: 'Karma test runner', publisher: 'Karma', version: '1.0.0', installed: false, category: 'Testing', downloads: '2M', rating: 4 },
  { id: 'mocha.mocha', name: 'Mocha', description: 'Mocha test framework', publisher: 'Mocha', version: '1.0.0', installed: false, category: 'Testing', downloads: '5M', rating: 4 },
  { id: 'nightwatch.nightwatch', name: 'Nightwatch', description: 'Nightwatch E2E', publisher: 'Nightwatch', version: '1.0.0', installed: false, category: 'Testing', downloads: '1M', rating: 4 },
  { id: 'protractor.protractor', name: 'Protractor', description: 'Protractor E2E', publisher: 'Protractor', version: '1.0.0', installed: false, category: 'Testing', downloads: '2M', rating: 4 },
  { id: 'qunit.qunit', name: 'QUnit', description: 'QUnit test framework', publisher: 'QUnit', version: '1.0.0', installed: false, category: 'Testing', downloads: '1M', rating: 3 },
  { id: 'selenium.selenium', name: 'Selenium', description: 'Selenium WebDriver', publisher: 'Selenium', version: '1.0.0', installed: false, category: 'Testing', downloads: '3M', rating: 4 },
  { id: 'tape.tape', name: 'Tape', description: 'Tape test harness', publisher: 'Tape', version: '1.0.0', installed: false, category: 'Testing', downloads: '1M', rating: 4 },
  { id: 'testing-library.testing-lib', name: 'Testing Library', description: 'DOM testing utils', publisher: 'Testing Library', version: '1.0.0', installed: false, category: 'Testing', downloads: '5M', rating: 5 },
  { id: 'webdriver.webdriver', name: 'WebDriver', description: 'WebDriver tools', publisher: 'WebDriver', version: '1.0.0', installed: false, category: 'Testing', downloads: '500K', rating: 3 },
  // Machine Learning (more tools)
  { id: 'aws.sagemaker', name: 'SageMaker', description: 'AWS SageMaker', publisher: 'Amazon', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'azure.azure-ml', name: 'Azure ML', description: 'Azure Machine Learning', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'datarobot.datarobot', name: 'DataRobot', description: 'DataRobot AutoML', publisher: 'DataRobot', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '300K', rating: 3 },
  { id: 'dvc.dvc', name: 'DVC', description: 'Data Version Control', publisher: 'DVC', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '500K', rating: 4 },
  { id: 'gcp.vertex-ai', name: 'Vertex AI', description: 'Google Vertex AI', publisher: 'Google', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '500K', rating: 4 },
  { id: 'h2o.h2o', name: 'H2O', description: 'H2O.ai platform', publisher: 'H2O', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '300K', rating: 3 },
  { id: 'jupyter.jupyter-more', name: 'Jupyter More', description: 'More Jupyter tools', publisher: 'Jupyter', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '2M', rating: 4 },
  { id: 'kubeflow.kubeflow', name: 'KubeFlow', description: 'Kubernetes ML', publisher: 'KubeFlow', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '500K', rating: 4 },
  { id: 'mlflow.mlflow', name: 'MLflow', description: 'MLflow tracking', publisher: 'MLflow', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'octave.octave', name: 'Octave', description: 'GNU Octave', publisher: 'Octave', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '500K', rating: 3 },
  { id: 'pandas.pandas', name: 'Pandas', description: 'Pandas data analysis', publisher: 'Pandas', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '2M', rating: 4 },
  { id: 'paperspace.paperspace', name: 'Paperspace', description: 'Paperspace GPU', publisher: 'Paperspace', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '300K', rating: 3 },
  { id: 'rapidminer.rapidminer', name: 'RapidMiner', description: 'RapidMiner studio', publisher: 'RapidMiner', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '200K', rating: 3 },
  { id: 'scipy.scipy', name: 'SciPy', description: 'SciPy computing', publisher: 'SciPy', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'sklearn.sklearn-more', name: 'SKLearn More', description: 'More scikit-learn', publisher: 'scikit', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'tensorflow.tensorflow-more', name: 'TF More', description: 'More TensorFlow', publisher: 'TensorFlow', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'theano.theano', name: 'Theano', description: 'Theano library', publisher: 'Theano', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '200K', rating: 3 },
  // Databases (more tools)
  { id: 'arangodb.arangodb', name: 'ArangoDB', description: 'ArangoDB multi-model', publisher: 'ArangoDB', version: '1.0.0', installed: false, category: 'Databases', downloads: '300K', rating: 4 },
  { id: 'cassandra.cassandra', name: 'Cassandra', description: 'Apache Cassandra', publisher: 'Cassandra', version: '1.0.0', installed: false, category: 'Databases', downloads: '500K', rating: 4 },
  { id: 'clickhouse.clickhouse', name: 'ClickHouse', description: 'ClickHouse DB', publisher: 'ClickHouse', version: '1.0.0', installed: false, category: 'Databases', downloads: '300K', rating: 4 },
  { id: 'couchdb.couchdb', name: 'CouchDB', description: 'Apache CouchDB', publisher: 'CouchDB', version: '1.0.0', installed: false, category: 'Databases', downloads: '300K', rating: 3 },
  { id: 'dynamodb.dynamodb', name: 'DynamoDB', description: 'AWS DynamoDB', publisher: 'Amazon', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'elasticsearch.elasticsearch', name: 'Elasticsearch', description: 'Elasticsearch DB', publisher: 'Elastic', version: '1.0.0', installed: false, category: 'Databases', downloads: '2M', rating: 4 },
  { id: 'firebase.firebase-more', name: 'Firebase More', description: 'More Firebase tools', publisher: 'Firebase', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'mariadb.mariadb', name: 'MariaDB', description: 'MariaDB database', publisher: 'MariaDB', version: '1.0.0', installed: false, category: 'Databases', downloads: '500K', rating: 4 },
  { id: 'memgraph.memgraph', name: 'Memgraph', description: 'Memgraph graph DB', publisher: 'Memgraph', version: '1.0.0', installed: false, category: 'Databases', downloads: '200K', rating: 3 },
  { id: 'mongodb.mongodb-more', name: 'MongoDB More', description: 'More MongoDB tools', publisher: 'MongoDB', version: '1.0.0', installed: false, category: 'Databases', downloads: '2M', rating: 4 },
  { id: 'mysql.mysql-workbench', name: 'MySQL Workbench', description: 'MySQL Workbench', publisher: 'MySQL', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'neo4j.neo4j-more', name: 'Neo4j More', description: 'More Neo4j tools', publisher: 'Neo4j', version: '1.0.0', installed: false, category: 'Databases', downloads: '500K', rating: 4 },
  { id: 'oracle.oracle-db', name: 'Oracle DB', description: 'Oracle database', publisher: 'Oracle', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'postgresql.postgresql-more', name: 'PostgreSQL More', description: 'More Postgres tools', publisher: 'PostgreSQL', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'redis.redis-more', name: 'Redis More', description: 'More Redis tools', publisher: 'Redis', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'rethinkdb.rethinkdb', name: 'RethinkDB', description: 'RethinkDB realtime', publisher: 'RethinkDB', version: '1.0.0', installed: false, category: 'Databases', downloads: '300K', rating: 3 },
  { id: 'supabase.supabase', name: 'Supabase', description: 'Supabase platform', publisher: 'Supabase', version: '1.0.0', installed: false, category: 'Databases', downloads: '2M', rating: 5 },
  { id: 'tidb.tidb', name: 'TiDB', description: 'TiDB distributed DB', publisher: 'PingCAP', version: '1.0.0', installed: false, category: 'Databases', downloads: '300K', rating: 4 },
];

console.log(`Adding ${newExts.length} new extensions (excluding themes)`);

// Read the current ExtensionsPanel.tsx to get existing extensions
const panelPath = path.join(__dirname, '..', 'src', 'renderer', 'components', 'Sidebar', 'ExtensionsPanel.tsx');
const panelContent = fs.readFileSync(panelPath, 'utf8');

// Extract existing extensions
const extMatch = panelContent.match(/const ALL_EXTENSIONS: ExtensionItem\[\] = \[([\s\S]*?)\];/);
if (!extMatch) {
  console.error('Could not find ALL_EXTENSIONS array');
  process.exit(1);
}

// Parse existing extensions
const existingExts = [];
const extRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*publisher:\s*'([^']+)',\s*version:\s*'([^']+)',\s*installed:\s*(true|false),\s*category:\s*'([^']+)',\s*downloads:\s*'([^']+)',\s*rating:\s*(\d+)\s*\}/g;

let match;
while ((match = extRegex.exec(extMatch[1])) !== null) {
  existingExts.push({
    id: match[1],
    name: match[2],
    description: match[3],
    publisher: match[4],
    version: match[5],
    installed: match[6] === 'true',
    category: match[7],
    downloads: match[8],
    rating: parseInt(match[9])
  });
}

console.log(`Found ${existingExts.length} existing extensions`);

// Combine all extensions
const allExts = [...existingExts, ...newExts];

// Remove duplicates by ID
const seen = new Set();
const uniqueExts = allExts.filter(ext => {
  if (seen.has(ext.id)) return false;
  seen.add(ext.id);
  return true;
});

console.log(`Total unique extensions: ${uniqueExts.length}`);

// Sort alphabetically by name
uniqueExts.sort((a, b) => a.name.localeCompare(b.name));

// Generate the output string
let output = 'const ALL_EXTENSIONS: ExtensionItem[] = [\n';
uniqueExts.forEach(ext => {
  output += `  { id: '${ext.id}', name: '${ext.name}', description: '${ext.description}', publisher: '${ext.publisher}', version: '${ext.version}', installed: ${ext.installed}, category: '${ext.category}', downloads: '${ext.downloads}', rating: ${ext.rating} },\n`;
});
output += '];\n';

// Write to the ExtensionsPanel.tsx file
const newPanelContent = panelContent.replace(
  /const ALL_EXTENSIONS: ExtensionItem\[\] = \[[\s\S]*?\];/,
  output
);

// Update the search placeholder
const updatedPanelContent = newPanelContent.replace(
  /placeholder="Search \d+\+ extensions\.\.\."/,
  `placeholder="Search ${uniqueExts.length}+ extensions..."`
);

fs.writeFileSync(panelPath, updatedPanelContent, 'utf8');

console.log(`ExtensionsPanel.tsx updated with ${uniqueExts.length} extensions!`);

import { Command } from 'commander';
import { runEnvDoctor } from '../features/env-doctor.js';
import { runCodeTutor } from '../features/code-tutor.js';
import { runNaturalCLI } from '../features/natural-cli.js';
import { runArchitect } from '../features/architect.js';

const program = new Command();

program
  .name('devcompass')
  .description('The Ultimate Student Developer Toolkit')
  .version('1.0.0');

program
  .command('doctor')
  .description('Diagnose and fix local environment setup issues')
  .action(() => {
    runEnvDoctor();
  });

program
  .command('review <file>')
  .description('Review code and explain why it can be improved')
  .action((file) => {
    runCodeTutor(file);
  });

program
  .command('ask <prompt>')
  .description('Translate natural language to a CLI command')
  .action((prompt) => {
    runNaturalCLI(prompt);
  });

program
  .command('architect')
  .description('Generate project boilerplate and architecture')
  .action(() => {
    runArchitect();
  });

program.parse(process.argv);

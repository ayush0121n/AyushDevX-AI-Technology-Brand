import { execSync } from 'child_process';

export function runEnvDoctor() {
  console.log('\x1b[34m%s\x1b[0m', 'Running EnvDoctor... checking your system for common developer tools.');
  
  const tools = ['node', 'npm', 'git'];
  let allGood = true;

  tools.forEach(tool => {
    try {
      const version = execSync(`${tool} --version`, { encoding: 'utf8' }).trim();
      console.log('\x1b[32m%s\x1b[0m', `\u2714 ${tool} is installed (version ${version})`);
    } catch (e) {
      console.log('\x1b[31m%s\x1b[0m', `\u2718 ${tool} is NOT installed or not in PATH.`);
      allGood = false;
    }
  });

  if (allGood) {
    console.log('\x1b[32m%s\x1b[0m', '\nYour basic environment looks good! \uD83D\uDE80');
  } else {
    console.log('\x1b[31m%s\x1b[0m', '\nWe found some missing tools. Please install them to continue.');
  }
}

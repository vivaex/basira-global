import { exec } from 'child_process';
console.log("Checking build errors...");
exec('npx next build', (err, stdout, stderr) => {
  import('fs').then(fs => {
    fs.writeFileSync('build-error.txt', stdout + '\n' + stderr);
    console.log("Done");
  });
});

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();

function getAllFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...getAllFiles(full));
    else if (['.js','.jsx'].includes(extname(full))) results.push(full);
  }
  return results;
}

const CLIENT_HOOKS = ['useRouter','usePathname','useSearchParams','useParams','useState','useEffect','useContext','useRef'];
const files = getAllFiles(join(ROOT, 'app', '_legacy'));

let issues = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const hasClientHook = CLIENT_HOOKS.some(h => src.includes(h + '('));
  const hasUseClient = src.trimStart().startsWith('"use client"') || src.trimStart().startsWith("'use client'");
  if (hasClientHook && !hasUseClient) {
    const hooks = CLIENT_HOOKS.filter(h => src.includes(h + '('));
    const rel = f.replace(ROOT, '').replace(/\\/g, '/');
    console.log('MISSING "use client": ' + rel);
    console.log('  hooks: ' + hooks.join(', '));
    issues++;
  }
}
console.log('\nTotal missing "use client": ' + issues);

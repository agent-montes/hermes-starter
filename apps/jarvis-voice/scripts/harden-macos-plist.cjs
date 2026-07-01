const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

function plistBuddy(plist, command, stdio = "ignore") {
  execFileSync("/usr/libexec/PlistBuddy", ["-c", command, plist], { stdio });
}

function exists(plist, key) {
  try {
    plistBuddy(plist, `Print ${key}`);
    return true;
  } catch {
    return false;
  }
}

function ensureDict(plist, key) {
  if (!exists(plist, key)) plistBuddy(plist, `Add ${key} dict`);
}

function setBool(plist, key, value) {
  if (exists(plist, key)) plistBuddy(plist, `Set ${key} ${value ? "true" : "false"}`);
  else plistBuddy(plist, `Add ${key} bool ${value ? "true" : "false"}`);
}

function setString(plist, key, value) {
  if (exists(plist, key)) plistBuddy(plist, `Set ${key} ${value}`);
  else plistBuddy(plist, `Add ${key} string ${value}`);
}

function harden(plist) {
  ensureDict(plist, ":NSAppTransportSecurity");
  setBool(plist, ":NSAppTransportSecurity:NSAllowsArbitraryLoads", false);
  setBool(plist, ":NSAppTransportSecurity:NSAllowsLocalNetworking", true);
  ensureDict(plist, ":NSAppTransportSecurity:NSExceptionDomains");
  for (const host of ["127.0.0.1", "localhost"]) {
    const base = `:NSAppTransportSecurity:NSExceptionDomains:${host}`;
    ensureDict(plist, base);
    setBool(plist, `${base}:NSIncludesSubdomains`, false);
    setBool(plist, `${base}:NSTemporaryExceptionAllowsInsecureHTTPLoads`, true);
    setBool(plist, `${base}:NSTemporaryExceptionAllowsInsecureHTTPSLoads`, false);
    setString(plist, `${base}:NSTemporaryExceptionMinimumTLSVersion`, "1.0");
    setBool(plist, `${base}:NSTemporaryExceptionRequiresForwardSecrecy`, false);
  }
}

function findAppPlist(appOutDir) {
  const app = fs.readdirSync(appOutDir).find((name) => name.endsWith(".app"));
  if (!app) throw new Error(`No .app bundle found in ${appOutDir}`);
  return path.join(appOutDir, app, "Contents", "Info.plist");
}

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  harden(findAppPlist(context.appOutDir));
};

if (require.main === module) {
  const target = process.argv[2];
  if (!target) throw new Error("Usage: node scripts/harden-macos-plist.cjs <App.app|Info.plist>");
  const stat = fs.statSync(target);
  const plist = stat.isDirectory() ? path.join(target, "Contents", "Info.plist") : target;
  harden(plist);
}

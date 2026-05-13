# Windows 签名与安装包发布说明

当前项目可以生成未签名 NSIS 安装包。商业公开上线前，建议完成代码签名，否则 Windows SmartScreen 可能提示未知发布者。

## 当前状态

`package.json` 中 Windows 构建暂时关闭签名：

```json
{
  "win": {
    "sign": false,
    "signAndEditExecutable": false
  }
}
```

这是为了在本地无证书环境下稳定生成安装包。正式发布时需要恢复签名流程。

## 正式签名需要准备

- 代码签名证书，建议 EV Code Signing 或信誉良好的 OV Code Signing。
- 证书主体与发行主体一致。
- 时间戳服务器，例如证书供应商推荐的 timestamp URL。
- CI/CD 或发布机器上的证书安全存储方式。
- 发布负责人确认签名后的安装包 SHA256。

## 建议发布流程

1. 更新 `package.json` 版本号。
2. 运行 `npm run typecheck`。
3. 运行 `npm run validate:story`。
4. 运行 `npm run route:smoke`。
5. 运行 `npm run test:e2e:smoke`。
6. 使用正式签名配置运行 `npm run dist:win`。
7. 在干净 Windows 10/11 机器安装测试。
8. 记录安装包文件名、版本号、SHA256、发布日期。
9. 发布下载页和版本说明。

## 本地验收命令

```bash
npm run release:win
```

`release:win` 会依次执行发布前验证、Windows 安装包构建和发布清单生成。

如果只需要重新生成安装包清单：

```bash
npm run release:manifest
```

生成文件：

```text
release/release-manifest.json
release/release-manifest.md
```

## 安装包命名建议

```text
AI校园生存模拟器-Setup-<version>-win-x64.exe
```

## 发布记录模板

```text
产品：AI 校园生存模拟器
版本：1.0.0
平台：Windows x64
发布日期：YYYY-MM-DD
安装包：AI校园生存模拟器 Setup 1.0.0.exe
SHA256：
签名主体：
发布负责人：
已知问题：
```

## 签名状态说明

当前本地流程会在 `release-manifest` 中标记安装包是否为未签名状态。只要 `package.json` 仍配置：

```json
"sign": false
```

就只能作为内部测试包或学校试点包，不建议直接公开分发。

## 仍需人工确认

- 证书是否可用。
- 安装包是否触发杀软误报。
- SmartScreen 首次下载提示是否可接受。
- 企业或学校内网环境是否允许 AI 代理地址。
- 卸载后本地数据保留策略是否符合用户预期。

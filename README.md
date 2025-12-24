# vue-element-plus-admin

执行```npm i```报错解决方案
```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
```

执行如下命令：

1. 使用--legacy-peer-deps选项
如果你并不关心具体的依赖冲突，或者在某些情况下希望忽略这些冲突，可以使用--legacy-peer-deps选项。这一选项告诉npm忽略对peer依赖的冲突检测，适用于临时解决问题。

```
npm install --legacy-peer-deps
```

2. 使用--force选项
你可以使用--force选项强制安装，忽略所有冲突。这一选项适用于某些情况下强制解决依赖问题，但需要注意，可能会导致未知的问题。

```
npm install --force
```
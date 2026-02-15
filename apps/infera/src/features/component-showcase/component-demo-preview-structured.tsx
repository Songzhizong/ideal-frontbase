import * as React from "react"
import dualColumnLayoutImage from "@/assets/images/menu_layouts/dual_column.png"
import horizontalLayoutImage from "@/assets/images/menu_layouts/horizontal.png"
import mixedLayoutImage from "@/assets/images/menu_layouts/mixed.png"
import verticalLayoutImage from "@/assets/images/menu_layouts/vertical.png"
import { Cascader, type CascaderOption } from "@/packages/ui/cascader"
import { Image, ImagePreviewGroup } from "@/packages/ui/image"
import {
  CardSkeleton,
  DetailSkeleton,
  FormSkeleton,
  TableSkeleton,
} from "@/packages/ui/skeleton-presets"
import { TagInput } from "@/packages/ui/tag-input"
import { Timeline } from "@/packages/ui/timeline"
import { Transfer, type TransferItem } from "@/packages/ui/transfer"
import { Tree, type TreeDataNode } from "@/packages/ui/tree"
import { TreeSelect, type TreeSelectValue } from "@/packages/ui/tree-select"

export type StructuredDemoSlug =
  | "timeline"
  | "tree"
  | "tree-select"
  | "cascader"
  | "transfer"
  | "image"
  | "tag-input"
  | "skeleton-presets"

type ComponentDemoPreviewRenderer = () => React.ReactNode

const TREE_SAMPLE_DATA: TreeDataNode[] = [
  {
    key: "cluster-a",
    title: "华东集群",
    children: [
      {
        key: "cluster-a-dev",
        title: "dev 命名空间",
      },
      {
        key: "cluster-a-prod",
        title: "prod 命名空间",
      },
    ],
  },
  {
    key: "cluster-b",
    title: "华南集群",
    children: [
      {
        key: "cluster-b-shared",
        title: "shared 命名空间",
      },
    ],
  },
]

const CASCADER_SAMPLE_OPTIONS: CascaderOption[] = [
  {
    value: "cn",
    label: "中国",
    children: [
      {
        value: "hangzhou",
        label: "杭州",
        children: [
          {
            value: "az1",
            label: "可用区 A",
            isLeaf: true,
          },
          {
            value: "az2",
            label: "可用区 B",
            isLeaf: true,
          },
        ],
      },
      {
        value: "shenzhen",
        label: "深圳",
        children: [
          {
            value: "az1",
            label: "可用区 A",
            isLeaf: true,
          },
        ],
      },
    ],
  },
  {
    value: "sg",
    label: "新加坡",
    children: [
      {
        value: "region-1",
        label: "Region-1",
        isLeaf: true,
      },
    ],
  },
]

const TRANSFER_SAMPLE_DATA: TransferItem[] = [
  { key: "u-1", title: "Alice", description: "平台管理员" },
  { key: "u-2", title: "Bob", description: "项目负责人" },
  { key: "u-3", title: "Carol", description: "算法工程师" },
  { key: "u-4", title: "David", description: "测试工程师" },
  { key: "u-5", title: "Eve", description: "观测平台" },
]

function TimelinePreview() {
  return (
    <Timeline
      mode="alternate"
      items={[
        {
          title: "创建服务",
          description: "初始化服务配置与环境变量",
          time: "2026-02-14 09:12",
          color: "info",
        },
        {
          title: "灰度发布",
          description: "流量切到 20%",
          time: "2026-02-14 11:45",
          color: "warning",
        },
        {
          title: "全量发布",
          description: "错误率低于阈值，发布完成",
          time: "2026-02-14 12:30",
          color: "success",
        },
      ]}
    />
  )
}

function TreePreview() {
  return (
    <Tree
      treeData={TREE_SAMPLE_DATA}
      checkable
      draggable
      virtual
      height={220}
      defaultExpandedKeys={["cluster-a", "cluster-b"]}
      defaultCheckedKeys={["cluster-a-dev"]}
    />
  )
}

function TreeSelectPreview() {
  const [value, setValue] = React.useState<TreeSelectValue>(["cluster-a-prod"])

  return (
    <TreeSelect
      treeData={TREE_SAMPLE_DATA}
      multiple
      searchable
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue)
      }}
      placeholder="选择命名空间"
    />
  )
}

function CascaderPreview() {
  return <Cascader options={CASCADER_SAMPLE_OPTIONS} placeholder="请选择部署路径" />
}

function TransferPreview() {
  const [targetKeys, setTargetKeys] = React.useState<string[]>(["u-2", "u-5"])

  return (
    <Transfer
      dataSource={TRANSFER_SAMPLE_DATA}
      targetKeys={targetKeys}
      onChange={(nextTargetKeys) => {
        setTargetKeys(nextTargetKeys)
      }}
      sourceTitle="可选成员"
      targetTitle="已加入发布组"
    />
  )
}

function ImagePreview() {
  return (
    <ImagePreviewGroup className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Image src={verticalLayoutImage} preview lazy alt="vertical" containerClassName="h-28" />
      <Image src={horizontalLayoutImage} preview lazy alt="horizontal" containerClassName="h-28" />
      <Image src={mixedLayoutImage} preview lazy alt="mixed" containerClassName="h-28" />
      <Image src={dualColumnLayoutImage} preview lazy alt="dual-column" containerClassName="h-28" />
    </ImagePreviewGroup>
  )
}

function TagInputPreview() {
  const [tags, setTags] = React.useState<string[]>(["production", "gpu"])

  return (
    <TagInput
      value={tags}
      onChange={setTags}
      max={6}
      placeholder="输入标签后按 Enter"
      validateTag={(tag) => tag.length <= 12}
    />
  )
}

function SkeletonPresetsPreview() {
  return (
    <div className="space-y-4">
      <CardSkeleton cards={2} />
      <TableSkeleton rows={3} columns={4} />
      <FormSkeleton rows={3} />
      <DetailSkeleton rows={4} />
    </div>
  )
}

export const STRUCTURED_COMPONENT_PREVIEW_RENDERERS = {
  timeline: TimelinePreview,
  tree: TreePreview,
  "tree-select": TreeSelectPreview,
  cascader: CascaderPreview,
  transfer: TransferPreview,
  image: ImagePreview,
  "tag-input": TagInputPreview,
  "skeleton-presets": SkeletonPresetsPreview,
} satisfies Record<StructuredDemoSlug, ComponentDemoPreviewRenderer>

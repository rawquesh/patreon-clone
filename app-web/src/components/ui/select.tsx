"use client"

import type { CollectionItem } from "@chakra-ui/react"
import { Select as ChakraSelect, Portal } from "@chakra-ui/react"
import { CloseButton } from "./close-button"
import * as React from "react"

interface SelectTriggerProps extends ChakraSelect.ControlProps {
  clearable?: boolean
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(props, ref) {
  const { children, clearable, ...rest } = props
  return (
    <ChakraSelect.Control {...rest}>
      <ChakraSelect.Trigger
        ref={ref}
        css={{
          borderRadius: "10px",
          border: "1px solid hsl(210, 30%, 88%)",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(8px)",
          transition: "all 0.15s ease",
          "&:hover": {
            borderColor: "hsl(211, 71%, 43%)",
          },
          "&:focus-within": {
            borderColor: "hsl(211, 71%, 43%)",
            boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.2)",
          },
        }}
      >
        {children}
      </ChakraSelect.Trigger>
      <ChakraSelect.IndicatorGroup>
        {clearable && <SelectClearTrigger />}
        <ChakraSelect.Indicator />
      </ChakraSelect.IndicatorGroup>
    </ChakraSelect.Control>
  )
})

const SelectClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraSelect.ClearTriggerProps
>(function SelectClearTrigger(props, ref) {
  return (
    <ChakraSelect.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton
        size="xs"
        variant="plain"
        focusVisibleRing="inside"
        focusRingWidth="2px"
        pointerEvents="auto"
      />
    </ChakraSelect.ClearTrigger>
  )
})

interface SelectContentProps extends ChakraSelect.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(function SelectContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content
          {...rest}
          ref={ref}
          className="glass-menu"
          borderRadius="12px"
          overflow="hidden"
          css={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)",
            backdropFilter: "blur(16px)",
            minW: "180px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        />
      </ChakraSelect.Positioner>
    </Portal>
  )
})

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.ItemProps
>(function SelectItem(props, ref) {
  const { item, children, ...rest } = props
  return (
    <ChakraSelect.Item key={item.value} item={item} {...rest} ref={ref}>
      {children}
      <ChakraSelect.ItemIndicator />
    </ChakraSelect.Item>
  )
})

interface SelectValueTextProps
  extends Omit<ChakraSelect.ValueTextProps, "children"> {
  children?(items: CollectionItem[]): React.ReactNode
}

export const SelectValueText = React.forwardRef<
  HTMLSpanElement,
  SelectValueTextProps
>(function SelectValueText(props, ref) {
  const { children, ...rest } = props
  return (
    <ChakraSelect.ValueText {...rest} ref={ref}>
      <ChakraSelect.Context>
        {(select) => {
          const items = select.selectedItems
          if (items.length === 0) return props.placeholder
          if (children) return children(items)
          if (items.length === 1)
            return select.collection.stringifyItem(items[0])
          return `${items.length} selected`
        }}
      </ChakraSelect.Context>
    </ChakraSelect.ValueText>
  )
})

export const SelectRoot = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.RootProps
>(function SelectRoot(props, ref) {
  return (
    <ChakraSelect.Root
      {...props}
      ref={ref}
      positioning={{ sameWidth: true, ...props.positioning }}
    >
      {props.asChild ? (
        props.children
      ) : (
        <>
          <ChakraSelect.HiddenSelect />
          {props.children}
        </>
      )}
    </ChakraSelect.Root>
  )
}) as ChakraSelect.RootComponent

interface SelectItemGroupProps extends ChakraSelect.ItemGroupProps {
  label: React.ReactNode
}

export const SelectItemGroup = React.forwardRef<
  HTMLDivElement,
  SelectItemGroupProps
>(function SelectItemGroup(props, ref) {
  const { children, label, ...rest } = props
  return (
    <ChakraSelect.ItemGroup {...rest} ref={ref}>
      <ChakraSelect.ItemGroupLabel>{label}</ChakraSelect.ItemGroupLabel>
      {children}
    </ChakraSelect.ItemGroup>
  )
})

export const SelectLabel = ChakraSelect.Label
export const SelectItemText = ChakraSelect.ItemText

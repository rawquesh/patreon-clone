import { Drawer as ChakraDrawer, Portal } from "@chakra-ui/react"
import { CloseButton } from "./close-button"
import * as React from "react"

interface DrawerContentProps extends ChakraDrawer.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  offset?: ChakraDrawer.ContentProps["padding"]
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(function DrawerContent(props, ref) {
  const { children, portalled = true, portalRef, offset, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraDrawer.Positioner padding={offset}>
        <ChakraDrawer.Content
          ref={ref}
          {...rest}
          asChild={false}
          className="glass-card"
          borderRadius="16px 0 0 16px"
          css={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)",
            backdropFilter: "blur(24px)",
          }}
        >
          {children}
        </ChakraDrawer.Content>
      </ChakraDrawer.Positioner>
    </Portal>
  )
})

export const DrawerCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraDrawer.CloseTriggerProps
>(function DrawerCloseTrigger(props, ref) {
  return (
    <ChakraDrawer.CloseTrigger
      position="absolute"
      top="3"
      insetEnd="3"
      {...props}
      asChild
    >
      <CloseButton size="sm" ref={ref} />
    </ChakraDrawer.CloseTrigger>
  )
})

export const DrawerTrigger = ChakraDrawer.Trigger
export const DrawerRoot = ChakraDrawer.Root
export const DrawerFooter = ChakraDrawer.Footer
export const DrawerHeader = ChakraDrawer.Header
export const DrawerBody = ChakraDrawer.Body
export const DrawerBackdrop = ChakraDrawer.Backdrop
export const DrawerDescription = ChakraDrawer.Description
export const DrawerTitle = ChakraDrawer.Title
export const DrawerActionTrigger = ChakraDrawer.ActionTrigger

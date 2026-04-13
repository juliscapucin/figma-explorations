import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "object",
      description: "The initial open accordion item value(s)",
    },
    className: {
      control: false,
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    defaultValue: [],
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="accordion-1">
        <AccordionTrigger>Accordion subject line 1</AccordionTrigger>
        <AccordionContent>
          This is an accordion item with a trigger and content rendered using the shared UI
          component.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-2">
        <AccordionTrigger>Accordion subject line 2</AccordionTrigger>
        <AccordionContent>
          This is an accordion item with a trigger and content rendered using the shared UI
          component.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-3">
        <AccordionTrigger>Accordion subject line 3</AccordionTrigger>
        <AccordionContent>
          This is an accordion item with a trigger and content rendered using the shared UI
          component.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

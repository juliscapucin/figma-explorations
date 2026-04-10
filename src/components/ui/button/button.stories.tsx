import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button, type ButtonState } from "./button";

const variants = ["primary", "secondary", "ghost"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;
const states: ButtonState[] = ["default", "hover", "active", "active-hover", "disabled"];

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: variants,
    },
    size: {
      control: { type: "select" },
      options: sizes,
    },
    state: {
      control: { type: "select" },
      options: states,
    },
    children: {
      control: "text",
      description: "The text to display in the button plus icon if provided",
    },
    className: {
      control: false,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    variant: "primary",
    size: "md",
    state: "default",
    children: "Button",
  },
};

export const VariantSizeStateMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-10 bg-background p-8 text-foreground">
      {variants.map((variant) => (
        <section key={variant} className="flex flex-col gap-4">
          <h3 className="text-title-small leading-title-small tracking-title-small capitalize">
            {variant}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-x-3 border-spacing-y-2">
              <thead>
                <tr className="text-left text-label-small leading-label-small tracking-label-small">
                  <th className="px-2 py-1">State</th>
                  {sizes.map((size) => (
                    <th key={size} className="px-2 py-1 uppercase">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {states.map((state) => (
                  <tr key={`${variant}-${state}`}>
                    <td className="px-2 py-1 text-label-small leading-label-small tracking-label-small capitalize">
                      {state}
                    </td>
                    {sizes.map((size) => (
                      <td key={`${variant}-${state}-${size}`} className="px-2 py-1">
                        <Button variant={variant} size={size} state={state}>
                          Hello
                        </Button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  ),
};

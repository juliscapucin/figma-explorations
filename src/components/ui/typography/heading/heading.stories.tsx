import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TypographyHeading } from "./heading";

const variants = ["display", "headline", "title"] as const;
const tags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  title: "UI/Typography/Heading",
  component: TypographyHeading,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: variants,
    },
    tag: {
      control: { type: "select" },
      options: tags,
    },
    children: {
      control: "text",
      description: "The text to display in the heading",
    },
    className: {
      control: "text",
      description: "The class name to apply to the heading",
    },
  },
} satisfies Meta<typeof TypographyHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    variant: "headline",
    tag: "h1",
    children: "This is a Heading",
  },
};

export const VariantTagMatrix: Story = {
  args: {
    variant: "headline",
    tag: "h1",
    children: "Heading",
  },
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
                  <th className="px-2 py-1">Tag</th>
                  <th className="px-2 py-1">Preview</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={`${variant}-${tag}`}>
                    <td className="px-2 py-1 text-label-small leading-label-small tracking-label-small uppercase">
                      {tag}
                    </td>
                    <td className="px-2 py-1">
                      <TypographyHeading tag={tag} variant={variant}>
                        {`${variant} ${tag.toUpperCase()} heading`}
                      </TypographyHeading>
                    </td>
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

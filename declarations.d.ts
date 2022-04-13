declare module "*.css";

declare module 'remark-collapse' {
    // eslint-disable-next-line import/no-default-export
    export default function remarkCollapse(options: {
        test: string | RegExp | ((arg0: string, arg2: Node) => boolean),
        summary: (arg0: string) => string | string
    }): void
}
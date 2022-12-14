// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  CodeBlock,
  getParserByLanguage,
} from "@etherdata-blockchain/codeblock";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export interface Message {
  code: string;
  blocks?: CodeBlock<any>[];
  language: string;
  mode: "generate" | "parse";
}

interface HandlerResponse {
  statusCode: number;
  body: any;
}

export function service({
  code,
  language,
  mode,
  blocks,
}: Message): HandlerResponse {
  try {
    const parser = getParserByLanguage(language);
    if (mode === "parse") {
      const blocks = parser.input(code).parse();

      const data = {
        blocks,
      };

      return {
        statusCode: 200,
        body: data,
      };
    }

    if (mode === "generate") {
      const generatedCode = parser.input(code).generate(blocks!);

      const data = {
        code: generatedCode,
      };

      return {
        statusCode: 200,
        body: data,
      };
    }

    return {
      statusCode: 400,
      body: {
        message: "Error: mode not supported",
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: {
        message: `${err}`,
      },
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;
  const response = service(data);

  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200,
  });

  res.status(response.statusCode).json(response.body);
}

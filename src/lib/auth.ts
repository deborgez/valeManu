import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PERFIS, perfilValido, type Perfil } from "@/lib/perfis";

const INTERVALO_REVALIDACAO_MS = 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const senha = credentials?.senha as string | undefined;
        if (!email || !senha) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const senhaValida = await bcrypt.compare(senha, user.senhaHash);
        if (!senhaValida) return null;

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          role: user.role,
          unidade: user.unidade,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.unidade = (user as { unidade?: string | null }).unidade ?? null;
        token.verificadoEm = Date.now();
        return token;
      }
      // O perfil pode mudar depois do login: confere no banco para a sessão não ficar desatualizada.
      const perfilConhecido = PERFIS.includes(token.role as Perfil);
      const verificadoEm = (token.verificadoEm as number | undefined) ?? 0;
      if (perfilConhecido && Date.now() - verificadoEm < INTERVALO_REVALIDACAO_MS) return token;
      try {
        const atual = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, unidade: true },
        });
        if (!atual) return null; // usuário excluído: encerra a sessão
        token.role = atual.role;
        token.unidade = atual.unidade ?? null;
        token.verificadoEm = Date.now();
      } catch (erro) {
        console.error("Falha ao atualizar o perfil da sessão:", erro);
        token.role = perfilValido(token.role);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.unidade = (token.unidade as string | null) ?? null;
      }
      return session;
    },
  },
});

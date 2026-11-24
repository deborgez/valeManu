import { describe, expect, it } from "vitest";
import {
  paginaInicial,
  perfilValido,
  podeEntregarVistoria,
  podeSolicitarVistoria,
  rotaPermitida,
} from "./perfis";

describe("rotaPermitida", () => {
  it("vistoriador só acessa a seção de vistorias", () => {
    expect(rotaPermitida("VISTORIADOR", "/vistorias/solicitacoes")).toBe(true);
    expect(rotaPermitida("VISTORIADOR", "/vistorias/entrada")).toBe(true);
    expect(rotaPermitida("VISTORIADOR", "/")).toBe(false);
    expect(rotaPermitida("VISTORIADOR", "/cadastro")).toBe(false);
    expect(rotaPermitida("VISTORIADOR", "/distrato")).toBe(false);
  });

  it("corretor acessa processos e vistorias, mas não edita processo nem vê o quadro do vistoriador", () => {
    expect(rotaPermitida("CORRETOR", "/cadastro")).toBe(true);
    expect(rotaPermitida("CORRETOR", "/cadastro/novo")).toBe(true);
    expect(rotaPermitida("CORRETOR", "/cadastro/abc/editar")).toBe(false);
    expect(rotaPermitida("CORRETOR", "/vistorias/entrada")).toBe(true);
    expect(rotaPermitida("CORRETOR", "/vistorias/solicitacoes")).toBe(false);
    expect(rotaPermitida("CORRETOR", "/distrato")).toBe(false);
    expect(rotaPermitida("CORRETOR", "/manutencoes")).toBe(false);
  });

  it("administrativo vê tudo, menos o quadro de solicitações do vistoriador", () => {
    expect(rotaPermitida("ADMINISTRATIVO", "/distrato")).toBe(true);
    expect(rotaPermitida("ADMINISTRATIVO", "/vistorias/relatorios")).toBe(true);
    expect(rotaPermitida("ADMINISTRATIVO", "/vistorias/solicitacoes")).toBe(false);
  });

  it("administrador acessa o quadro de solicitações", () => {
    expect(rotaPermitida("ADMIN", "/vistorias/solicitacoes")).toBe(true);
    expect(rotaPermitida("ADMIN", "/usuarios")).toBe(true);
  });

  it("notificações e conta valem para todos os perfis", () => {
    for (const perfil of ["ADMIN", "ADMINISTRATIVO", "VISTORIADOR", "CORRETOR"]) {
      expect(rotaPermitida(perfil, "/notificacoes")).toBe(true);
      expect(rotaPermitida(perfil, "/conta")).toBe(true);
    }
  });
});

describe("permissões de vistoria", () => {
  it("quem pode solicitar", () => {
    expect(podeSolicitarVistoria("ADMIN")).toBe(true);
    expect(podeSolicitarVistoria("ADMINISTRATIVO")).toBe(true);
    expect(podeSolicitarVistoria("CORRETOR")).toBe(true);
    expect(podeSolicitarVistoria("VISTORIADOR")).toBe(false);
    expect(podeSolicitarVistoria(undefined)).toBe(false);
  });

  it("quem pode entregar", () => {
    expect(podeEntregarVistoria("ADMIN")).toBe(true);
    expect(podeEntregarVistoria("VISTORIADOR")).toBe(true);
    expect(podeEntregarVistoria("ADMINISTRATIVO")).toBe(false);
    expect(podeEntregarVistoria("CORRETOR")).toBe(false);
  });
});

describe("página inicial e perfil válido", () => {
  it("cada perfil começa no lugar certo", () => {
    expect(paginaInicial("VISTORIADOR")).toBe("/vistorias/solicitacoes");
    expect(paginaInicial("CORRETOR")).toBe("/cadastro");
    expect(paginaInicial("ADMIN")).toBe("/");
  });

  it("perfil desconhecido vira administrativo", () => {
    expect(perfilValido("QUALQUER")).toBe("ADMINISTRATIVO");
    expect(perfilValido("CORRETOR")).toBe("CORRETOR");
  });
});

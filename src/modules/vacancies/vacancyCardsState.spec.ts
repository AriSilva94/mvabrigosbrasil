import { describe, expect, it } from "vitest";

import { getInitialVacanciesTransition } from "./vacancyCardsState";

describe("vacancy cards initial state transition", () => {
  it("replaces a pending empty fetch when initial vacancies become available", () => {
    const vacancies = [{ id: "v1", title: "Plantao", slug: "plantao" }];

    expect(getInitialVacanciesTransition(vacancies)).toEqual({
      vacancies,
      loading: false,
      error: null,
    });
  });

  it("keeps the fetch path for an empty initial list", () => {
    expect(getInitialVacanciesTransition([])).toBeNull();
  });
});

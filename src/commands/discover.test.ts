/**
 * Tests for ov discover command.
 *
 * Tests cover the pure functions and command structure.
 * Scout spawning is not tested here (requires tmux and external processes).
 */

import { describe, expect, test } from "bun:test";
import { ValidationError } from "../errors.ts";
import {
	createDiscoverCommand,
	DISCOVERY_CATEGORIES,
	discoverCommand,
	VALID_CATEGORY_NAMES,
} from "./discover.ts";

describe("DISCOVERY_CATEGORIES", () => {
	test("has exactly 6 categories", () => {
		expect(DISCOVERY_CATEGORIES).toHaveLength(6);
	});

	test("each category has name, subject, and body", () => {
		for (const category of DISCOVERY_CATEGORIES) {
			expect(category.name).toBeTruthy();
			expect(category.subject).toBeTruthy();
			expect(category.body).toBeTruthy();
		}
	});

	test("contains all expected category names", () => {
		const names = DISCOVERY_CATEGORIES.map((c) => c.name);
		expect(names).toContain("architecture");
		expect(names).toContain("dependencies");
		expect(names).toContain("testing");
		expect(names).toContain("apis");
		expect(names).toContain("config");
		expect(names).toContain("implicit");
	});
});

describe("VALID_CATEGORY_NAMES", () => {
	test("contains all 6 category names", () => {
		expect(VALID_CATEGORY_NAMES.size).toBe(6);
		expect(VALID_CATEGORY_NAMES.has("architecture")).toBe(true);
		expect(VALID_CATEGORY_NAMES.has("dependencies")).toBe(true);
		expect(VALID_CATEGORY_NAMES.has("testing")).toBe(true);
		expect(VALID_CATEGORY_NAMES.has("apis")).toBe(true);
		expect(VALID_CATEGORY_NAMES.has("config")).toBe(true);
		expect(VALID_CATEGORY_NAMES.has("implicit")).toBe(true);
	});

	test("does not contain invalid category names", () => {
		expect(VALID_CATEGORY_NAMES.has("unknown")).toBe(false);
		expect(VALID_CATEGORY_NAMES.has("")).toBe(false);
	});
});

describe("createDiscoverCommand()", () => {
	test("returns a Command with name 'discover'", () => {
		const cmd = createDiscoverCommand();
		expect(cmd.name()).toBe("discover");
	});

	test("has --skip option", () => {
		const cmd = createDiscoverCommand();
		// Verify option is registered by checking the command definition
		const option = cmd.options.find((o) => o.long === "--skip");
		expect(option).toBeDefined();
	});

	test("has --name option", () => {
		const cmd = createDiscoverCommand();
		const option = cmd.options.find((o) => o.long === "--name");
		expect(option).toBeDefined();
	});

	test("has --task-id option", () => {
		const cmd = createDiscoverCommand();
		const option = cmd.options.find((o) => o.long === "--task-id");
		expect(option).toBeDefined();
	});

	test("has --json option", () => {
		const cmd = createDiscoverCommand();
		const option = cmd.options.find((o) => o.long === "--json");
		expect(option).toBeDefined();
	});

	test("has a description", () => {
		const cmd = createDiscoverCommand();
		expect(cmd.description()).toBeTruthy();
	});
});

describe("discoverCommand() skip validation", () => {
	test("throws ValidationError for invalid category name", async () => {
		await expect(discoverCommand({ skip: "notacategory" })).rejects.toThrow(ValidationError);
	});

	test("throws ValidationError for mixed valid and invalid categories", async () => {
		await expect(discoverCommand({ skip: "architecture,notacategory" })).rejects.toThrow(
			ValidationError,
		);
	});

	test("throws ValidationError when all categories are skipped", async () => {
		const allCategories = DISCOVERY_CATEGORIES.map((c) => c.name).join(",");
		await expect(discoverCommand({ skip: allCategories })).rejects.toThrow(ValidationError);
	});

	test("throws ValidationError with helpful message for invalid category", async () => {
		let thrownError: unknown;
		try {
			await discoverCommand({ skip: "badcategory" });
		} catch (err) {
			thrownError = err;
		}
		expect(thrownError).toBeInstanceOf(ValidationError);
		const ve = thrownError as ValidationError;
		expect(ve.message).toContain("badcategory");
		expect(ve.message).toContain("Valid categories");
	});
});

import { describe, it, before, beforeEach, after } from 'mocha';
import { configLoader } from '@config/ConfigLoader';
import { logger } from '@utils/Logger';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { TodoPage } from '@pages/TodoPage';

/**
 * TodoTest - Demonstrates BasePage, BaseTest, TodoPage, and SanAssertion framework
 */
class TodoTest extends BaseTest<TodoPage> {
    protected createPage(): TodoPage {
        return new TodoPage();
    }
}

describe('TodoMVC App - Page Object Pattern & Assertions', () => {
    const test = new TodoTest();
    let todoPage: TodoPage;
    let baseUrl: string;

    before(async () => {
        // BaseTest handles driver initialization and page object creation
        await test.setupDriver();
        todoPage = test.page;
        baseUrl = configLoader.getBaseUrl();
    });

    beforeEach(async () => {
        // Open TodoMVC app before each test
        await todoPage.open(baseUrl);
    });

    after(async () => {
        // BaseTest handles driver cleanup
        await test.teardownDriver();
    });

    describe('Add Todo Item', () => {
        it('should add multiple todo items and verify with assertions', async () => {
            const todos = ['Learn SaniumTS Framework', 'Build page objects', 'Write tests'];

            for (const todoText of todos) {
                logger.info(`Adding todo: ${todoText}`);
                await todoPage.addTodo(todoText);
            }

            logger.info('Verifying todo input is visible');
            await sanExpect(todoPage.newTodoInput).toBeVisible();

            logger.info('Verifying page title with auto-retry');
            await sanExpect(todoPage).toHaveTitle('React • TodoMVC');
        });
    });

    describe('Page Assertions', () => {
        it('should verify page title and URL assertions', async () => {
            logger.info('Verifying page URL contains todomvc');
            await sanExpect(todoPage).toHaveURL(/todomvc/);

            logger.info('Verifying page title is correct');
            await sanExpect(todoPage).toHaveTitle('React • TodoMVC');

            logger.info('Adding todo via TodoPage');
            await todoPage.addTodo('Test item');

            logger.info('Verifying todo input is visible');
            await sanExpect(todoPage.newTodoInput).toBeVisible();
        });

        it('should support RegExp pattern matching in URL assertions', async () => {
            logger.info('Verifying URL with RegExp pattern (flexible domain matching)');
            // RegExp allows flexible pattern matching for dynamic or environment-specific URLs
            // This pattern matches demo.playwright.dev and similar domains with /todomvc path
            await sanExpect(todoPage).toHaveURL(/https?:\/\/.*todomvc/);
            logger.info('Domain-agnostic RegExp assertion passed');

            logger.info('Verifying URL contains expected hash fragment with RegExp');
            // Match hash fragments like #/ (all items), #/active, #/completed
            await sanExpect(todoPage).toHaveURL(/#\//);

            logger.info('Adding todo to navigate with hash');
            await todoPage.addTodo('RegExp test item');

            logger.info('Verifying hash-based navigation with RegExp');
            // RegExp advantage: match any filter state in hash without knowing exact text
            await sanExpect(todoPage).toHaveURL(/#\/?(?:active|completed)?$/);
        });
    });
});

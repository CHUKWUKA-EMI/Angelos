import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedTopicEntity1693931269641 implements MigrationInterface {
    name = 'UpdatedTopicEntity1693931269641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "hasSchema"`);
        await queryRunner.query(`ALTER TABLE "topic" DROP COLUMN "schema"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topic" ADD "schema" json`);
        await queryRunner.query(`ALTER TABLE "topic" ADD "hasSchema" boolean NOT NULL DEFAULT false`);
    }

}

import { store } from "../main.js";
import { embed, getFontColour } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchSupporters, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "owner",
    coowner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 999" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <div class="packs" v-if="level.packs.length > 0">
                        <div v-for="pack in level.packs" class="tag" :style="{background:pack.colour}">
                            <p>{{pack.name}}</p>
                        </div>
                    </div>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify, list.length) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 150"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else>100% or better to qualify</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Original List by <a href="https://tsl.pages.dev/#/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3 align="center">List Editors</h3>
                        <ol class="editors">
                            <ol class="rank" v-for="rank in editors">
                                <li v-for="member in rank.members">
                                    <img :src="\`/assets/\${roleIconMap[rank.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="rank.role">
                                    <a v-if="member.link" class="type-label-lg link" target="_blank" :href="member.link">{{ member.name }}</a>
                                    <p v-else>{{ member.name }}</p>
                                </li>
                            </ol>
                        </ol>
                        <ol class="editors">
                            <ol class="rank" v-for="rank in supporters">
                                <li v-for="member in rank.members">
                                    <img :src="\`/assets/\${roleIconMap[rank.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="rank.role">
                                    <a v-if="member.link" class="type-label-lg link" target="_blank" :href="member.link">{{ member.name }}</a>
                                    <p v-else>{{ member.name }}</p>
                                </li>
                            </ol>
                        </ol>
                    </template>
                     <h3>> Cara mengirim rekor</h3>
                    <p>
                        Gabung server discord kita, verifikasi, cari channel #📩｜kirim-rekor dan klik text biru
                    </p>
                    <h3>> Persyaratan pengiriman</h3>
                    <p>
                        Saat mengirim rekor mu, pastikan bahwa itu mematuhi aturan berikut:
                    </p>
                    <p>
                        - Rekor mu harus memiliki penyelesaian lengkap dari 0-100 (tergantung berapa % atau keatas untuk kualifikasi) tanpa potongan (jika kamu membuat pemotongan pada video yang kamu kirimkan, sertakan rekaman mentah yang tidak ada potongan).
                    </p>
                     <p>
                        - Rekor mu harus memiliki sejumlah attempts sebelumnya (satu kematian pada 1% tidaklah cukup, cobalah untuk mencapai level yang lebih jauh. Catatan Everplay dikecualikan dari hal ini).  
                    </p>

                    <p>
                        - Pastikan Anda mengalahkan level yang ditampilkan di situs (atau versi LDM yang disetujui, untuk referensi, periksa ID level untuk memastikan kamu memainkan level yang benar).
                    </p>
                    <p>
                        - Jangan menggunakan rute rahasia atau rute bug.
                    </p>
                    <p>
                        - Cheat Indicator diperlukan jika kamu menggunakan mod menu yang mendukungnya, seperti Megahack v7.
                    </p>
                    <p>
                        - End stats (seluruh kotak harus muncul setidaknya untuk satu frame)
                    </p>
                    <p>
                        - FPS/TPS counter diperlukan
                    </p>
                    <p>
                        - Suara klik (Jika tidak, atau jika hanya terjadi pada sebagian level dan tidak sepanjang permainan, kamu harus menyediakan rekaman mentah dengan klik. Pemain mobile TIDAK dikecualikan dari aturan ini, rekaman taps, atau klik external diperlukan.)
                    </p>
                    <p>
                        - Jangan menggunakan mode easy, hanya rekaman level yang tidak dimodifikasi yang memenuhi syarat
                    </p>
                    <p>
                        - Pastikan kamu bermain di versi 2.2 atau keatas
                    </p>
                    <p>
                        - Setelah level jatuh ke Legacy List, kami menerima rekor untuknya selama 24 jam setelah jatuh, kemudian setelah itu kami tidak pernah menerima rekor untuk level tersebut.
                    </p>
                    <p>
                        - Ada beberapa mod/hacks yg tidak boleh digunakan saat merekam level, baca <a href="https://docs.google.com/spreadsheets/d/1evE4nXATxRAQWu2Ajs54E6cVUqHBoSid8I7JauJnOzg/edit?usp=drivesdk">sheet</a> ini untuk melihat apa saja mod/hack yg diperbolehkan dan tidak diperbolehkan. Untuk mod geode, <a href="https://docs.google.com/spreadsheets/d/1N0UeSHTm7jCLOrS8fiSi1YYpcFHSdD40nvnBXLwaPys/edit?usp=sharing">baca ini.</a>
                    </p>
                    <h3>> Why was my record denied?</h3>
                    <p>
                        If your record was denied, please check the following:
                    </p>
                    <p>
                        Does the video meet the requirements? (Above)
                    </p>
                    <p>
                        Is the level placed on the list? (#pending-changes)
                    </p>
                    <p>
                        Was the submission command filled out correctly?
                    </p>
                    <p>
                        Was the record submitted with several links?
                    </p>
                    <p>
                        Note: You will be pinged in #records with the reason why your record was denied. If you are still unsure of why it was denied, or if the record was wrongfully denied, please make a post in #support or DM any list staff on Discord
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        embed,
        score,
        getFontColour,
    },
};
